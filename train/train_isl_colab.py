# ISL Fingerspelling Classifier — Google Colab Training Notebook
# Dataset: 35 classes (digits 1-9, letters A-Z), ~1200 images/class, 128x128 RGB
# Model: MobileNetV2 transfer learning → exported to TensorFlow.js
#
# NOTE: This dataset covers STATIC fingerspelling only (digits + letters),
# not full word/phrase Indian Sign Language. Output is per-character.

# ============================================================
# CELL 1: Setup & Mount Drive
# ============================================================
# Run this cell first. Upload your archive.zip to Google Drive.

# !pip install tensorflowjs pillow

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json, shutil

print(f"TensorFlow version: {tf.__version__}")
print(f"GPU available: {tf.config.list_physical_devices('GPU')}")

# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# ============================================================
# CELL 2: Extract Dataset
# ============================================================
# Upload archive.zip to your Google Drive root, then run:

DRIVE_ZIP = '/content/drive/MyDrive/archive.zip'
EXTRACT_DIR = '/content/dataset'

if not os.path.exists(os.path.join(EXTRACT_DIR, 'Indian')):
    print('Extracting dataset...')
    import zipfile
    with zipfile.ZipFile(DRIVE_ZIP, 'r') as z:
        z.extractall(EXTRACT_DIR)
    print('Done!')
else:
    print('Dataset already extracted.')

DATA_DIR = os.path.join(EXTRACT_DIR, 'Indian')
classes = sorted(os.listdir(DATA_DIR))
print(f"Classes ({len(classes)}): {classes}")

# Count images per class
for c in classes[:5]:
    n = len(os.listdir(os.path.join(DATA_DIR, c)))
    print(f"  {c}: {n} images")
print(f"  ... (showing first 5 of {len(classes)})")

# ============================================================
# CELL 3: Prepare Data Splits (80/10/10)
# ============================================================

IMG_SIZE = 128
BATCH_SIZE = 32
NUM_CLASSES = len(classes)

# Create class-to-index mapping
class_names = classes  # Already sorted: ['1','2',...,'9','A','B',...,'Z']
class_to_idx = {c: i for i, c in enumerate(class_names)}

print(f"\nClass mapping ({NUM_CLASSES} classes):")
for c, i in class_to_idx.items():
    print(f"  {c} -> {i}")

# Use Keras ImageDataGenerator for train/val/test split
# First, create a validation split generator

train_datagen = ImageDataGenerator(
    rescale=1.0/255.0,
    rotation_range=15,
    brightness_range=[0.8, 1.2],
    zoom_range=[0.9, 1.1],
    width_shift_range=0.05,
    height_shift_range=0.05,
    fill_mode='nearest',
    # NO horizontal_flip — flips would swap sign meaning!
    validation_split=0.2  # 20% for val+test
)

test_datagen = ImageDataGenerator(
    rescale=1.0/255.0,
    validation_split=0.2
)

# Train: 80%
train_gen = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True,
    seed=42
)

# Val+Test: 20% (we'll use this as validation during training)
val_gen = test_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False,
    seed=42
)

print(f"\nTrain samples: {train_gen.samples}")
print(f"Val+Test samples: {val_gen.samples}")
print(f"Classes: {list(train_gen.class_indices.keys())}")

# Save class names in the order the model uses
model_class_names = list(train_gen.class_indices.keys())
print(f"\nModel class order: {model_class_names}")

# ============================================================
# CELL 4: Build Model (MobileNetV2 Transfer Learning)
# ============================================================

# Load MobileNetV2 pretrained on ImageNet, without top classifier
base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

# Freeze base model initially
base_model.trainable = False

# Build classifier on top
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(NUM_CLASSES, activation='softmax')
], name='isl_classifier')

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()
print(f"\nTotal params: {model.count_params():,}")

# ============================================================
# CELL 5: Train — Phase 1 (Frozen Base)
# ============================================================

EPOCHS_FROZEN = 8

history1 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FROZEN,
    callbacks=[
        callbacks.EarlyStopping(patience=3, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=2, monitor='val_loss'),
    ]
)

print(f"\nPhase 1 done. Val accuracy: {history1.history['val_accuracy'][-1]:.4f}")

# ============================================================
# CELL 6: Train — Phase 2 (Fine-tune top layers)
# ============================================================

# Unfreeze last 30 layers of MobileNetV2 for fine-tuning
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

# Recompile with lower learning rate
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

EPOCHS_FINETUNE = 12

history2 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FINETUNE,
    callbacks=[
        callbacks.EarlyStopping(patience=4, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=2, monitor='val_loss'),
    ]
)

print(f"\nPhase 2 done. Val accuracy: {history2.history['val_accuracy'][-1]:.4f}")

# ============================================================
# CELL 7: Evaluate on Validation Set
# ============================================================

val_loss, val_acc = model.evaluate(val_gen)
print(f"\nFinal Validation Accuracy: {val_acc:.4f} ({val_acc*100:.1f}%)")
print(f"Final Validation Loss: {val_loss:.4f}")

# ============================================================
# CELL 8: Save Keras Model
# ============================================================

SAVE_DIR = '/content/isl_model'
model.save(os.path.join(SAVE_DIR, 'isl_classifier.keras'))
print(f"Keras model saved to {SAVE_DIR}")

# Save class names mapping
class_info = {
    'class_names': model_class_names,
    'num_classes': NUM_CLASSES,
    'img_size': IMG_SIZE,
    'note': 'Static fingerspelling only (digits 1-9, letters A-Z). Not full ISL.'
}
with open(os.path.join(SAVE_DIR, 'class_names.json'), 'w') as f:
    json.dump(class_info, f, indent=2)
print(f"Class names saved to {SAVE_DIR}/class_names.json")

# ============================================================
# CELL 9: Convert to TensorFlow.js Format
# ============================================================

# !pip install tensorflowjs

import subprocess
TFJS_DIR = '/content/isl_tfjs'

result = subprocess.run([
    'tensorflowjs_converter',
    '--input_format=keras',
    '--output_format=tfjs_layers_model',
    '--quantize_uint8',  # Quantize to reduce size (~4x smaller)
    os.path.join(SAVE_DIR, 'isl_classifier.keras'),
    TFJS_DIR
], capture_output=True, text=True)

print(result.stdout)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
else:
    # List exported files
    files = os.listdir(TFJS_DIR)
    total_size = sum(os.path.getsize(os.path.join(TFJS_DIR, f)) for f in files)
    print(f"\nExported {len(files)} files, total: {total_size/1024/1024:.1f} MB")
    for f in sorted(files):
        sz = os.path.getsize(os.path.join(TFJS_DIR, f))
        print(f"  {f}: {sz/1024:.1f} KB")

# Also copy class_names.json to TFJS dir
shutil.copy(os.path.join(SAVE_DIR, 'class_names.json'), TFJS_DIR)
print(f"\nclass_names.json copied to {TFJS_DIR}")

# ============================================================
# CELL 10: Download Model Files
# ============================================================

# Zip the TFJS model for download
DOWNLOAD_ZIP = '/content/isl-classifier-tfjs.zip'
shutil.make_archive(DOWNLOAD_ZIP.replace('.zip',''), 'zip', TFJS_DIR)

# Download to your computer
from google.colab import files
files.download(DOWNLOAD_ZIP)
print(f"\nDownload started! Place contents in: assets/models/isl-classifier/")

# ============================================================
# CELL 11: Quick Test — Predict on a sample image
# ============================================================

from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt

# Pick a random test image
test_class = model_class_names[0]
test_dir = os.path.join(DATA_DIR, test_class)
test_file = os.listdir(test_dir)[0]
test_path = os.path.join(test_dir, test_file)

img = image.load_img(test_path, target_size=(IMG_SIZE, IMG_SIZE))
img_array = image.img_to_array(img) / 255.0
img_batch = np.expand_dims(img_array, 0)

preds = model.predict(img_batch)[0]
top_idx = np.argmax(preds)
top_label = model_class_names[top_idx]
top_conf = preds[top_idx]

plt.figure(figsize=(4, 4))
plt.imshow(img)
plt.title(f"Predicted: {top_label} ({top_conf*100:.1f}%)\nActual: {test_class}")
plt.axis('off')
plt.show()

# Show top 5 predictions
top5 = np.argsort(preds)[-5:][::-1]
print("\nTop 5 predictions:")
for i in top5:
    print(f"  {model_class_names[i]}: {preds[i]*100:.1f}%")
