"""
Re-export ISL model as TF.js GraphModel.
Patches the broken tensorflow_hub import in tensorflowjs before converting.
"""
import os, sys, shutil, types
os.environ["KERAS_BACKEND"] = "tensorflow"
os.environ["PYTHONIOENCODING"] = "utf-8"

# --- Stub out tensorflow_hub before anything imports it ---
hub_stub = types.ModuleType("tensorflow_hub")
hub_stub.load = None
hub_stub.KerasLayer = None
sys.modules["tensorflow_hub"] = hub_stub
print("Stubbed tensorflow_hub")

import tensorflow as tf
import keras
print("TF:", tf.__version__, "Keras:", keras.__version__)

KERAS_PATH = r"C:\Users\pramodh\.gemini\antigravity\scratch\kahaniverse\train\isl_classifier_fast.keras"
OUT_DIR    = r"C:\Users\pramodh\.gemini\antigravity\scratch\kahaniverse\assets\models\isl-classifier"
TMP_DIR    = r"C:\Users\pramodh\.gemini\antigravity\scratch\kahaniverse\train\saved_model_tmp"

# 1. Load model
print("Loading .keras model ...")
model = keras.models.load_model(KERAS_PATH)
print("Loaded. Output:", model.output_shape)

# 2. Save as SavedModel
@tf.function(input_signature=[tf.TensorSpec([None, 128, 128, 3], tf.float32)])
def serve(x):
    return {"output": model(x, training=False)}

if os.path.exists(TMP_DIR):
    shutil.rmtree(TMP_DIR)
tf.saved_model.save(model, TMP_DIR, signatures={"serving_default": serve})
print("SavedModel saved to:", TMP_DIR)

# 3. Convert using tf_saved_model_conversion_v2 directly
from tensorflowjs.converters import tf_saved_model_conversion_v2 as conv

print("Converting to TF.js GraphModel ...")
for fname in os.listdir(OUT_DIR):
    if fname != "class_names.json":
        fpath = os.path.join(OUT_DIR, fname)
        if os.path.isfile(fpath):
            os.remove(fpath)
            print("  Removed:", fname)

conv.convert_tf_saved_model(
    TMP_DIR,
    OUT_DIR,
    signature_def="serving_default",
    saved_model_tags="serve",
)

shutil.rmtree(TMP_DIR, ignore_errors=True)

print("\nFiles in output:")
for f in sorted(os.listdir(OUT_DIR)):
    size = os.path.getsize(os.path.join(OUT_DIR, f))
    print(f"  {f}: {size:,} bytes")

print("\nALL DONE - GraphModel export successful!")
