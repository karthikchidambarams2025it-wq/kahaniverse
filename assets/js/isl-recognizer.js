/**
 * ISL RECOGNIZER — Shared recognition module for Kahaniverse
 * 
 * NOTE: This dataset covers STATIC fingerspelling only (digits 1-9, letters A-Z),
 * not full word/phrase Indian Sign Language (ISL). Output is per-character.
 * 
 * Usage:
 *   await ISLRecognizer.init();
 *   const result = await ISLRecognizer.predict(videoElement);
 *   // result = { label: 'A', confidence: 0.95, allPredictions: [...] }
 * 
 * Requires:
 *   - TensorFlow.js (loaded via CDN)
 *   - MediaPipe Hands (for hand detection/cropping)
 *   - Model files at assets/models/isl-classifier/model.json
 */

const ISLRecognizer = (function () {
  'use strict';

  // ─── State ───
  let model = null;
  let classNames = [];
  let ready = false;
  let loading = false;

  // Canvas for image preprocessing
  let cropCanvas = null;
  let cropCtx = null;

  // MediaPipe Hands instance for hand detection
  let hands = null;
  let latestLandmarks = null;
  let latestImage = null;

  // Prediction stabilization
  let lastLabel = null;
  let lastLabelStart = 0;
  let stableLabel = null;

  // ─── Configuration ───
  const IMG_SIZE = 128;
  const MODEL_PATH = 'assets/models/isl-classifier/model.json';
  const CLASS_NAMES_PATH = 'assets/models/isl-classifier/class_names.json';
  const MIN_CONFIDENCE = 0.4; // Minimum confidence to accept prediction
  const HAND_PADDING = 0.25;  // 25% padding around detected hand

  // ─── Init ───
  async function init() {
    if (ready || loading) return ready;
    loading = true;

    try {
      console.log('[ISLRecognizer] Loading TF.js model...');

      // Load class names
      const classResp = await fetch(CLASS_NAMES_PATH);
      if (!classResp.ok) throw new Error('class_names.json not found at ' + CLASS_NAMES_PATH);
      const classInfo = await classResp.json();
      classNames = classInfo.class_names || classInfo;
      console.log(`[ISLRecognizer] ${classNames.length} classes: ${classNames.join(', ')}`);

      // Load TF.js model
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0"></script>');
      }
      model = await tf.loadLayersModel(MODEL_PATH);
      console.log('[ISLRecognizer] Model loaded successfully');

      // Warm up with dummy prediction
      const dummy = tf.zeros([1, IMG_SIZE, IMG_SIZE, 3]);
      model.predict(dummy).dispose();
      dummy.dispose();
      console.log('[ISLRecognizer] Model warmed up');

      // Create crop canvas
      cropCanvas = document.createElement('canvas');
      cropCanvas.width = IMG_SIZE;
      cropCanvas.height = IMG_SIZE;
      cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });

      ready = true;
      loading = false;
      console.log('[ISLRecognizer] Ready!');
      return true;

    } catch (err) {
      console.error('[ISLRecognizer] Init failed:', err);
      loading = false;
      return false;
    }
  }

  // ─── Hand Crop from Video ───
  // Uses bounding box from MediaPipe landmarks to crop the hand region
  function cropHandFromVideo(videoEl, landmarks) {
    if (!landmarks || landmarks.length < 21) return null;

    const vw = videoEl.videoWidth || videoEl.width;
    const vh = videoEl.videoHeight || videoEl.height;
    if (!vw || !vh) return null;

    // Get bounding box of hand landmarks
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const lm of landmarks) {
      minX = Math.min(minX, lm.x);
      minY = Math.min(minY, lm.y);
      maxX = Math.max(maxX, lm.x);
      maxY = Math.max(maxY, lm.y);
    }

    // Add padding
    const w = maxX - minX;
    const h = maxY - minY;
    const pad = Math.max(w, h) * HAND_PADDING;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(1, maxX + pad);
    maxY = Math.min(1, maxY + pad);

    // Make it square (use max dimension)
    const cropW = maxX - minX;
    const cropH = maxY - minY;
    const side = Math.max(cropW, cropH);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const sx = Math.max(0, cx - side / 2) * vw;
    const sy = Math.max(0, cy - side / 2) * vh;
    const sSize = Math.min(side * Math.max(vw, vh), Math.min(vw - sx, vh - sy));

    // Draw cropped hand onto 128x128 canvas
    cropCtx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
    cropCtx.drawImage(videoEl, sx, sy, sSize, sSize, 0, 0, IMG_SIZE, IMG_SIZE);

    return cropCanvas;
  }

  // ─── Classify Cropped Image ───
  function classifyImage(canvas) {
    if (!model || !canvas) return null;

    return tf.tidy(() => {
      // Convert canvas to tensor: [1, 128, 128, 3], normalized to [0, 1]
      let tensor = tf.browser.fromPixels(canvas)
        .toFloat()
        .div(255.0)
        .expandDims(0);

      // Run prediction
      const predictions = model.predict(tensor);
      const probs = predictions.dataSync();

      // Find top prediction
      let topIdx = 0;
      let topConf = 0;
      for (let i = 0; i < probs.length; i++) {
        if (probs[i] > topConf) {
          topConf = probs[i];
          topIdx = i;
        }
      }

      // Build all predictions for debugging
      const allPreds = [];
      for (let i = 0; i < probs.length; i++) {
        allPreds.push({ label: classNames[i], confidence: probs[i] });
      }
      allPreds.sort((a, b) => b.confidence - a.confidence);

      return {
        label: classNames[topIdx] || 'unknown',
        confidence: topConf,
        allPredictions: allPreds.slice(0, 5) // top 5
      };
    });
  }

  // ─── Main Predict Function ───
  // Call this with a video element and optionally landmarks from MediaPipe
  // If landmarks not provided, does full-frame classification (less accurate)
  async function predict(videoEl, landmarks) {
    if (!ready || !model) return { label: 'none', confidence: 0 };

    let canvas;
    if (landmarks && landmarks.length >= 21) {
      // Crop hand using MediaPipe landmarks
      canvas = cropHandFromVideo(videoEl, landmarks);
    } else {
      // Fallback: use full frame (less accurate but works without MediaPipe)
      cropCtx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
      cropCtx.drawImage(videoEl, 0, 0, IMG_SIZE, IMG_SIZE);
      canvas = cropCanvas;
    }

    if (!canvas) return { label: 'none', confidence: 0 };

    const result = classifyImage(canvas);
    if (!result || result.confidence < MIN_CONFIDENCE) {
      return { label: 'none', confidence: result ? result.confidence : 0 };
    }

    return result;
  }

  // ─── Stabilized Predict ───
  // Only "commits" a label after it's been the top prediction for holdMs
  function updateStable(prediction, holdMs) {
    holdMs = holdMs || 600;
    const now = Date.now();

    if (prediction.label === 'none' || prediction.confidence < MIN_CONFIDENCE) {
      lastLabel = null;
      lastLabelStart = 0;
      return { committed: false, label: prediction.label, confidence: prediction.confidence, holdProgress: 0 };
    }

    if (prediction.label !== lastLabel) {
      // New label detected — start hold timer
      lastLabel = prediction.label;
      lastLabelStart = now;
    }

    const elapsed = now - lastLabelStart;
    const progress = Math.min(1, elapsed / holdMs);

    if (progress >= 1 && lastLabel !== stableLabel) {
      // Committed!
      stableLabel = lastLabel;
      lastLabel = null;
      lastLabelStart = 0;
      return { committed: true, label: stableLabel, confidence: prediction.confidence, holdProgress: 1 };
    }

    return { committed: false, label: lastLabel, confidence: prediction.confidence, holdProgress: progress };
  }

  // ─── Reset ───
  function reset() {
    lastLabel = null;
    lastLabelStart = 0;
    stableLabel = null;
  }

  // ─── Public API ───
  return {
    init: init,
    predict: predict,
    updateStable: updateStable,
    reset: reset,
    get ready() { return ready; },
    get classNames() { return classNames.slice(); },
    get model() { return model; }
  };

})();

// Expose globally
window.ISLRecognizer = ISLRecognizer;
