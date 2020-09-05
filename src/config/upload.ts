import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

const tmpPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  destinary: tmpPath,
  storage: multer.diskStorage({
    destination: tmpPath,
    filename(request: Request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
