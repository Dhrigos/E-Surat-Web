import { createWorker } from 'tesseract.js';

export interface OCRResult {
    nik: string | null;
    nama: string | null;
    tanggal_lahir: string | null; // YYYY-MM-DD
}

export async function processKTP(imageSrc: string): Promise<OCRResult> {
    const worker = await createWorker('ind');

    // Improve accuracy for KTP specifics
    await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:/ ',
    });

    const { data: { text } } = await worker.recognize(imageSrc);
    await worker.terminate();

    console.log("OCR Result:", text);

    return parseKTPText(text);
}

function parseKTPText(text: string): OCRResult {
    const lines = text.split('\n').map(l => l.trim().toUpperCase());

    let nik: string | null = null;
    let nama: string | null = null;
    let tanggal_lahir: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Find NIK
        // NIK is usually 16 digits, but OCR often sees 'B' as '8', 'O' as '0', '?' as '7', etc.
        // Also might have spaces: 3273 05...
        // Regex: Look for 12-17 "digit-like" characters
        const possibleNikMatch = line.match(/[0-9\s?OolLiI]{12,20}/);

        if (possibleNikMatch && !nik) {
            // Clean the match
            let clean = possibleNikMatch[0].toUpperCase()
                .replace(/O/g, '0')
                .replace(/L/g, '1')
                .replace(/I/g, '1')
                .replace(/\?/g, '7')
                .replace(/B/g, '8')
                .replace(/[^0-9]/g, '');

            if (clean.length === 16) {
                nik = clean;
                continue;
            }
        }

        // Find Nama
        // Usually line after "NAMA"
        if (line.includes('NAMA') && !nama) {
            // Check if name is on same line, e.g. "Nama : John Doe"
            const parts = line.split(':');
            if (parts.length > 1 && parts[1].trim().length > 2) {
                nama = parts[1].trim();
            } else {
                // Check next line
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    // Basic heuristic: contains letters, not too many numbers
                    if (nextLine.length > 2 && !nextLine.includes('NIK')) {
                        nama = nextLine.replace(/[^A-Z\s]/g, '').trim();
                    }
                }
            }
            continue;
        }

        // Find Tanggal Lahir
        // Look for pattern DD-MM-YYYY
        // Often near "Tempat/Tgl Lahir"
        if ((line.includes('LAHIR') || line.includes('TGL')) && !tanggal_lahir) {
            const dateMatch = line.match(/(\d{2})-(\d{2})-(\d{4})/);
            if (dateMatch) {
                // Convert to YYYY-MM-DD
                tanggal_lahir = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            }
        }
    }

    return { nik, nama, tanggal_lahir };
}
