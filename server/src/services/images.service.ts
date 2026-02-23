import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { r2Client } from '../lib/r2.js';
import { config } from '../config.js';
import { prisma } from '../lib/prisma.js';

export async function uploadImage(file: Express.Multer.File) {
  const ext = file.originalname.split('.').pop() || 'bin';
  const key = `images/${randomUUID()}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `${config.r2.publicUrl}/${key}`;

  const image = await prisma.image.create({
    data: {
      key,
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    },
  });

  return image;
}

export async function deleteImage(id: string) {
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) throw new Error('Image not found');

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: image.key,
    })
  );

  await prisma.image.delete({ where: { id } });
}
