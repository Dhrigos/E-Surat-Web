import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

export async function loadFaceModels() {
    if (modelsLoaded) return;

    const MODEL_URL = '/models';
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
    console.log("FaceAPI Models Loaded");
}

export async function compareFaces(refImageSrc: string, probeImageSrc: string): Promise<number> {
    if (!modelsLoaded) await loadFaceModels();

    // Helper to create HTMLImageElement from src
    const createImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });

    const [img1, img2] = await Promise.all([createImage(refImageSrc), createImage(probeImageSrc)]);

    // Detect single face with descriptors
    const detection1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const detection2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

    if (!detection1) throw new Error("Wajah tidak terdeteksi pada foto KTP/Referensi");
    if (!detection2) throw new Error("Wajah tidak terdeteksi pada foto Selfie");

    const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);

    // FaceAPI distance: 0 = same match, > 0.6 = likely different
    // We convert to Similarity Score (1 = match, 0 = different)
    // Simple inversion for UI display: max(0, 1 - distance)

    const similarity = Math.max(0, 1 - distance);
    console.log(`Face Match Distance: ${distance}, Similarity: ${similarity}`);

    return similarity;
}
