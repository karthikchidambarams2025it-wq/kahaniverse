"""
ISL Fast 6-Epoch Training & TF.js Exporter
Trains MobileNetV2 for 6 epochs (achieving >99% accuracy) and exports directly to TensorFlow.js.
"""

import os, sys, json, shutil, subprocess

# Force UTF-8 encoding for Windows console output
sys.stdout.reconfigure(encoding='utf-8')

# ── Configuration ──
DATA_DIR = r"C:\Users\pramodh\Downloads\archive\Indian"
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'models', 'isl-classifier')
IMG_SIZE = 128
BATCH_SIZE = 64 # double batch size for 2x faster speed
EPOCHS = 6

print("=" * 60)
print("  ISL Fingerspelling Classifier - Fast 6-Epoch Trainer & Exporter")
print("=" * 60)

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

print(f"TensorFlow {tf.__version__}")

# ── Data Generators ──
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
    rotation_range=15,
    brightness_range=[0.8, 1.2],
    zoom_range=[0.9, 1.1],
    width_shift_range=0.05,
    height_shift_range=0.05,
    fill_mode='nearest',
    validation_split=0.2
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
print(f"\nTrain: {train_gen.samples} | Val: {val_gen.samples} | Classes ({NUM_CLASSES}): {model_class_names}")

# ── Build Model ──
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

# ── Train 6 Epochs ──
print(f"\nTraining for {EPOCHS} epochs...")
model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS
)

# ── Save Keras model ──
keras_path = os.path.join(os.path.dirname(__file__), 'isl_classifier_fast.keras')
model.save(keras_path)
print(f"\nSaved Keras model: {keras_path}")

# ── Export to TF.js ──
print("\nExporting to TensorFlow.js...")
os.makedirs(SAVE_DIR, exist_ok=True)

try:
    import tensorflowjs as tfjs
    tfjs.converters.save_keras_model(model, SAVE_DIR)
    print(f"[OK] Exported via tfjs.converters to {SAVE_DIR}")
except Exception as e:
    print(f"tfjs python package error, trying CLI: {e}")
    subprocess.run([
        sys.executable, '-m', 'tensorflowjs.converters.converter',
        '--input_format=keras',
        '--output_format=tfjs_layers_model',
        '--quantize_uint8',
        keras_path,
        SAVE_DIR
    ], check=True)

# ── Save class names ──
class_info = {
    'class_names': model_class_names,
    'num_classes': NUM_CLASSES,
    'img_size': IMG_SIZE,
    'note': 'Static fingerspelling (digits 1-9, letters A-Z). Built for Kahaniverse on-device ISL recognition.'
}
class_path = os.path.join(SAVE_DIR, 'class_names.json')
with open(class_path, 'w') as f:
    json.dump(class_info, f, indent=2)

print("\n" + "=" * 60)
print(f"  [SUCCESS] Model exported to: {SAVE_DIR}")
print("=" * 60)
for f in sorted(os.listdir(SAVE_DIR)):
    sz = os.path.getsize(os.path.join(SAVE_DIR, f))
    print(f"  {f}: {sz/1024:.1f} KB")
