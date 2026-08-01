"""
Standalone Keras to TF.js Converter for Kahaniverse ISL Model
Converts Keras model -> assets/models/isl-classifier/ (model.json + weight shards)
"""

import os, sys, json, tempfile

sys.stdout.reconfigure(encoding='utf-8')

KERAS_PATH = os.path.join(os.path.dirname(__file__), 'isl_classifier_fast.keras')
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'models', 'isl-classifier')

print("=" * 60)
print("  Kahaniverse ISL Model - Keras to TF.js Exporter")
print("=" * 60)

import tensorflow as tf
# Use tf_keras (Keras 2 compat layer) for TF.js exporter compatibility
import tf_keras as keras
from tensorflowjs.converters import keras_h5_conversion

print(f"Loading Keras model with tf_keras...")
model = keras.models.load_model(KERAS_PATH)
print("Model loaded successfully!")
model.summary()

os.makedirs(SAVE_DIR, exist_ok=True)
print(f"\nExporting TF.js model to: {SAVE_DIR}")

keras_h5_conversion.save_keras_model(model, SAVE_DIR)

print("\n" + "=" * 60)
print(f"  [SUCCESS] Model exported to {SAVE_DIR}!")
print("=" * 60)

for f in sorted(os.listdir(SAVE_DIR)):
    sz = os.path.getsize(os.path.join(SAVE_DIR, f))
    print(f"  {f}: {sz/1024:.1f} KB")
