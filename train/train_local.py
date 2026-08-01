"""
ISL Fingerspelling Classifier — Local Training Script
Dataset: 35 classes (digits 1-9, letters A-Z), ~1200 images/class, 128x128 RGB
Model: MobileNetV2 transfer learning → exported to TensorFlow.js

NOTE: This dataset covers STATIC fingerspelling only (digits + letters),
not full word/phrase Indian Sign Language. Output is per-character.
"""

import os, sys, json, shutil

# Force UTF-8 encoding for Windows console output
sys.stdout.reconfigure(encoding='utf-8')

# ── Configuration ──
DATA_DIR = r"C:\Users\pramodh\Downloads\archive\Indian"
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'models', 'isl-classifier')
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS_FROZEN = 8
EPOCHS_FINETUNE = 12

print("=" * 60)
print("  ISL Fingerspelling Classifier - Training")
print("=" * 60)

# ── Verify dataset ──
if not os.path.isdir(DATA_DIR):
    print(f"ERROR: Dataset not found at {DATA_DIR}")
    sys.exit(1)

classes = sorted(os.listdir(DATA_DIR))
NUM_CLASSES = len(classes)
print(f"\nDataset: {DATA_DIR}")
print(f"Classes: {NUM_CLASSES} -> {classes}")

total = sum(len(os.listdir(os.path.join(DATA_DIR, c))) for c in classes)
print(f"Total images: {total:,}")

# ── Import TF ──
print("\nLoading TensorFlow...")
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

print(f"TensorFlow {tf.__version__}")
gpus = tf.config.list_physical_devices('GPU')
print(f"GPU: {gpus if gpus else 'None (CPU only — training will be slower)'}")

# ── Data Generators ──
print("\nPreparing data generators...")

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
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
    rescale=1.0 / 255.0,
    validation_split=0.2
)

train_gen = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True,
    seed=42
)

val_gen = test_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False,
    seed=42
)

NUM_CLASSES = train_gen.num_classes
model_class_names = list(train_gen.class_indices.keys())
print(f"Train: {train_gen.samples} | Val: {val_gen.samples}")
print(f"Classes ({NUM_CLASSES}): {model_class_names}")

# ── Build Model ──
print("\nBuilding MobileNetV2 model...")

base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

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

total_params = model.count_params()
print(f"Total params: {total_params:,}")

# ── Phase 1: Frozen base ──
print(f"\n{'='*60}")
print(f"  Phase 1: Training with frozen base ({EPOCHS_FROZEN} epochs)")
print(f"{'='*60}")

history1 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FROZEN,
    callbacks=[
        callbacks.EarlyStopping(patience=3, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=2, monitor='val_loss'),
    ]
)

val_acc1 = history1.history['val_accuracy'][-1]
print(f"\nPhase 1 done. Val accuracy: {val_acc1:.4f} ({val_acc1*100:.1f}%)")

# ── Phase 2: Fine-tune ──
print(f"\n{'='*60}")
print(f"  Phase 2: Fine-tuning top 30 layers ({EPOCHS_FINETUNE} epochs)")
print(f"{'='*60}")

base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FINETUNE,
    callbacks=[
        callbacks.EarlyStopping(patience=4, restore_best_weights=True, monitor='val_accuracy'),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=2, monitor='val_loss'),
    ]
)

val_acc2 = history2.history['val_accuracy'][-1]
print(f"\nPhase 2 done. Val accuracy: {val_acc2:.4f} ({val_acc2*100:.1f}%)")

# ── Final evaluation ──
val_loss, val_acc = model.evaluate(val_gen)
print(f"\n{'='*60}")
print(f"  FINAL: Val Accuracy = {val_acc*100:.1f}% | Val Loss = {val_loss:.4f}")
print(f"{'='*60}")

# ── Save Keras model ──
keras_path = os.path.join(os.path.dirname(__file__), 'isl_classifier.keras')
model.save(keras_path)
print(f"\nKeras model saved: {keras_path}")

# ── Export to TF.js ──
print("\nConverting to TensorFlow.js format...")
os.makedirs(SAVE_DIR, exist_ok=True)

import subprocess
result = subprocess.run([
    sys.executable, '-m', 'tensorflowjs.converters.converter',
    '--input_format=keras',
    '--output_format=tfjs_layers_model',
    '--quantize_uint8',
    keras_path,
    SAVE_DIR
], capture_output=True, text=True)

if result.returncode != 0:
    print(f"Converter error: {result.stderr}")
    # Try alternate method
    print("Trying alternate export method...")
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, SAVE_DIR)
        print("Exported via tfjs.converters.save_keras_model()")
    except Exception as e:
        print(f"Alternate export also failed: {e}")
        sys.exit(1)
else:
    print(result.stdout)

# ── Save class names ──
class_info = {
    'class_names': model_class_names,
    'num_classes': NUM_CLASSES,
    'img_size': IMG_SIZE,
    'note': 'Static fingerspelling only (digits 1-9, letters A-Z). Not full ISL.',
    'val_accuracy': float(val_acc),
}
class_path = os.path.join(SAVE_DIR, 'class_names.json')
with open(class_path, 'w') as f:
    json.dump(class_info, f, indent=2)

# ── Summary ──
files = os.listdir(SAVE_DIR)
total_size = sum(os.path.getsize(os.path.join(SAVE_DIR, f)) for f in files)
print(f"\n{'='*60}")
print(f"  DONE! Model exported to: {SAVE_DIR}")
print(f"  Files: {len(files)} | Total size: {total_size/1024/1024:.1f} MB")
print(f"{'='*60}")
for f in sorted(files):
    sz = os.path.getsize(os.path.join(SAVE_DIR, f))
    print(f"  {f}: {sz/1024:.1f} KB")

print(f"\n[OK] Ready! Push to GitHub and test with test-model.html")
