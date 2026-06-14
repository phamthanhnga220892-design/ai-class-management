import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadedFileResult {
    publicId: string;
    url: string;
    filename: string;
    fileType: 'image' | 'video' | 'document';
}

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private config: ConfigService) {
        const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = config.get('CLOUDINARY_API_KEY');
        const apiSecret = config.get('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.error(
                `Cloudinary chưa được cấu hình đầy đủ. ` +
                    `cloud_name: ${cloudName ? 'set' : 'MISSING'}, ` +
                    `api_key: ${apiKey ? 'set' : 'MISSING'}, ` +
                    `api_secret: ${apiSecret ? 'set' : 'MISSING'}`,
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }

    uploadFile(buffer: Buffer, originalname: string, mimetype: string): Promise<UploadedFileResult> {
        const { resourceType, fileType } = this.getMimeMapping(mimetype);
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: resourceType,
                        folder: 'products',
                        use_filename: true,
                        unique_filename: true,
                    },
                    (error, result) => {
                        if (error || !result) {
                            this.logger.error(
                                `Tải file "${originalname}" lên Cloudinary thất bại: ${error?.message ?? 'không có kết quả trả về'}`,
                            );
                            return reject(
                                new BadGatewayException('Không thể tải file lên, vui lòng thử lại'),
                            );
                        }
                        resolve({
                            publicId: result.public_id,
                            url: result.secure_url,
                            filename: originalname,
                            fileType,
                        });
                    },
                )
                .end(buffer);
        });
    }

    uploadThumbnail(buffer: Buffer): Promise<{ publicId: string; url: string }> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'products/thumbnails',
                        use_filename: true,
                        unique_filename: true,
                    },
                    (error, result) => {
                        if (error || !result) {
                            this.logger.error(
                                `Tải ảnh đại diện lên Cloudinary thất bại: ${error?.message ?? 'không có kết quả trả về'}`,
                            );
                            return reject(
                                new BadGatewayException('Không thể tải ảnh đại diện lên, vui lòng thử lại'),
                            );
                        }
                        resolve({ publicId: result.public_id, url: result.secure_url });
                    },
                )
                .end(buffer);
        });
    }

    async deleteThumbnail(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (error) {
            console.error(`Failed to delete thumbnail ${publicId}:`, error);
        }
    }

    private getMimeMapping(mimetype: string): {
        resourceType: 'image' | 'video' | 'raw';
        fileType: 'image' | 'video' | 'document';
    } {
        if (mimetype.startsWith('image/')) return { resourceType: 'image', fileType: 'image' };
        if (mimetype.startsWith('video/')) return { resourceType: 'video', fileType: 'video' };
        return { resourceType: 'raw', fileType: 'document' };
    }

    async deleteFile(publicId: string, fileType: 'image' | 'video' | 'document'): Promise<void> {
        const resourceType = fileType === 'video' ? 'video' : fileType === 'image' ? 'image' : 'raw';
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as any });
        } catch (error) {
            console.error(`Failed to delete file ${publicId} from Cloudinary:`, error);
        }
    }
}
