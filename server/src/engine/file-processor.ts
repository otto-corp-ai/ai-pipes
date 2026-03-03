import fs from 'fs';
import path from 'path';

interface ProcessResult {
  type: string;
  text: string;
  rows?: any[];
  base64?: string;
  metadata: {
    originalName: string;
    size: number;
    mimeType: string;
    pages?: number;
    rowCount?: number;
    duration?: number;
  };
}

const MAGIC_BYTES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const DOCX_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // ZIP (docx is a zip)

export function validateFileType(buffer: Buffer, declaredMime: string): boolean {
  // Text files don't have magic bytes
  if (declaredMime.startsWith('text/') || declaredMime === 'application/csv') return true;
  // Audio files - trust extension for now
  if (declaredMime.startsWith('audio/')) return true;

  // Check DOCX (ZIP-based)
  if (declaredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return checkMagic(buffer, DOCX_MAGIC);
  }

  const expected = MAGIC_BYTES[declaredMime];
  if (!expected) return true; // Unknown type, allow
  return checkMagic(buffer, expected);
}

function checkMagic(buffer: Buffer, expected: number[]): boolean {
  if (buffer.length < expected.length) return false;
  return expected.every((byte, i) => buffer[i] === byte);
}

// File size limits by tier (in bytes)
export const FILE_SIZE_LIMITS: Record<string, number> = {
  free: 10 * 1024 * 1024,
  starter: 25 * 1024 * 1024,
  pro: 100 * 1024 * 1024,
  business: 500 * 1024 * 1024,
};

export async function processFile(filePath: string, originalName: string, mimeType: string): Promise<ProcessResult> {
  const stat = fs.statSync(filePath);
  const ext = path.extname(originalName).toLowerCase();

  const base: ProcessResult = {
    type: ext.replace('.', ''),
    text: '',
    metadata: { originalName, size: stat.size, mimeType },
  };

  // PDF
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule.default || pdfParseModule) as any;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    base.text = data.text;
    base.metadata.pages = data.numpages;
    return base;
  }

  // DOCX
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    base.text = result.value;
    return base;
  }

  // CSV
  if (mimeType === 'text/csv' || mimeType === 'application/csv' || ext === '.csv') {
    const { parse } = await import('csv-parse/sync');
    const content = fs.readFileSync(filePath, 'utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true }) as any[];
    base.text = content;
    base.rows = rows;
    base.metadata.rowCount = rows.length;
    return base;
  }

  // Plain text
  if (mimeType.startsWith('text/') || ext === '.txt' || ext === '.md') {
    base.text = fs.readFileSync(filePath, 'utf-8');
    return base;
  }

  // Images
  if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    const buffer = fs.readFileSync(filePath);
    base.base64 = buffer.toString('base64');
    base.text = `[Image: ${originalName} (${(stat.size / 1024).toFixed(1)}KB)]`;
    return base;
  }

  // Audio (mp3, wav, m4a) - use OpenAI Whisper
  if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.m4a'].includes(ext)) {
    // We'll transcribe via OpenAI Whisper API if key is available
    // For now, return a placeholder - actual transcription happens in executor
    base.text = `[Audio file: ${originalName} - transcription pending]`;
    base.type = 'audio';
    return base;
  }

  // Fallback: try reading as text
  try {
    base.text = fs.readFileSync(filePath, 'utf-8');
  } catch {
    base.text = `[Unsupported file type: ${ext}]`;
  }
  return base;
}

export async function transcribeAudio(filePath: string, apiKey: string): Promise<string> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey });
  const response = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(filePath),
  });
  return response.text;
}
