import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const ALLOWED_MIMETYPES = [
    'image/',
    'video/',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const productMulterOptions = {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (file.fieldname === 'thumbnail') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('Ảnh đại diện phải là file ảnh'), false);
            }
            return cb(null, true);
        }
        const ok = ALLOWED_MIMETYPES.some((type) =>
            type.endsWith('/') ? file.mimetype.startsWith(type) : file.mimetype === type,
        );
        if (!ok) return cb(new BadRequestException('Định dạng file không được hỗ trợ'), false);
        cb(null, true);
    },
};
