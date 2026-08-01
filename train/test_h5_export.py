import os, sys, json

sys.stdout.reconfigure(encoding='utf-8')

KERAS_PATH = os.path.join(os.path.dirname(__file__), 'isl_classifier_fast.keras')
H5_PATH = os.path.join(os.path.dirname(__file__), 'isl_classifier.h5')
SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'models', 'isl-classifier')

print("Loading Keras 3 model...")
import tensorflow as tf
from tensorflow import keras

model = keras.models.load_model(KERAS_PATH)
print("Saving in legacy .h5 format...")
model.save(H5_PATH)
print("Saved .h5 successfully!")

# Now patch tensorflowjs and convert
from tensorflowjs.converters import keras_h5_conversion
os.makedirs(SAVE_DIR, exist_ok=True)
print(f"Converting .h5 to TF.js at: {SAVE_DIR}")
keras_h5_conversion.save_keras_model(model, SAVE_DIR)

print("\n[SUCCESS] Model files in assets/models/isl-classifier/:")
for f in sorted(os.listdir(SAVE_DIR)):
    sz = os.path.getsize(os.path.join(SAVE_DIR, f))
    print(f"  {f}: {sz/1024:.1f} KB")
