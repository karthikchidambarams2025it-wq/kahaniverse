# ISL Fingerspelling Classifier — Training Guide

## Quick Start (Google Colab)

### 1. Upload Dataset
- Upload `archive.zip` to your **Google Drive** root folder

### 2. Open Colab
- Go to [colab.research.google.com](https://colab.research.google.com)
- Create a **new notebook**
- Set runtime: **Runtime → Change runtime type → T4 GPU**

### 3. Install Dependencies
Run this in the first cell:
```python
!pip install tensorflowjs pillow
```

### 4. Copy & Run Training Script
- Copy the contents of `train_isl_colab.py` into cells
- Each `# CELL N:` section is a separate Colab cell
- Run cells 1-10 in order

### 5. Download Exported Model
- Cell 10 will download `isl-classifier-tfjs.zip`
- Extract it into `assets/models/isl-classifier/` in your project

## Expected Output

```
assets/models/isl-classifier/
├── model.json          (~5 KB)
├── group1-shard1of2.bin (~2 MB)
├── group1-shard2of2.bin (~1 MB)
└── class_names.json    (~1 KB)
```

## Model Details

| Property | Value |
|----------|-------|
| Architecture | MobileNetV2 + custom head |
| Input | 128×128 RGB |
| Output | 35 classes (1-9, A-Z) |
| Training | 2-phase: frozen base (8 epochs) + fine-tune (12 epochs) |
| Augmentation | Rotation ±15°, brightness, zoom; NO horizontal flip |
| Quantization | uint8 (~4x size reduction) |
| Expected accuracy | >90% on validation set |
| Inference | TensorFlow.js (browser, fully client-side) |

## Re-training

To re-train with different parameters:
1. Adjust `EPOCHS_FROZEN`, `EPOCHS_FINETUNE`, `BATCH_SIZE` in the script
2. Modify augmentation settings in `ImageDataGenerator`
3. Re-run cells 3-10
4. Download new model and replace files in `assets/models/isl-classifier/`

## Note
This dataset covers **static fingerspelling only** (digits 1-9, letters A-Z).
It does NOT cover full word/phrase Indian Sign Language (ISL).
Model output is per-character recognition.
