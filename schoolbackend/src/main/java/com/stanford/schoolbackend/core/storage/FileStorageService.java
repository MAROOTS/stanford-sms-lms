package com.stanford.schoolbackend.core.storage;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import io.minio.Http;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @PostConstruct
    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not initialize MinIO bucket", e);
        }
    }

    /**
     * Uploads a file and returns the object key (not a public URL — the bucket is private).
     * Use {@link #getPresignedUrl(String)} to generate a temporary access link when needed.
     */
    public String store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) return null;
        String extension = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf('.'));
        }
        String objectKey = folder + "/" + UUID.randomUUID() + extension;

        try (var inputStream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder().bucket(bucket).object(objectKey)
                    .stream(inputStream, file.getSize(), -1L).contentType(file.getContentType()).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO", e);
        }
        return objectKey;
    }

    public String store(MultipartFile file) {
        return store(file, "submissions"); // preserves existing behavior for assignment submissions
    }

    public String getPresignedUrl(String objectKey, long expiryHours) {
        if (objectKey == null) return null;
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Http.Method.GET).bucket(bucket).object(objectKey)
                    .expiry((int) expiryHours, TimeUnit.HOURS).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate file URL", e);
        }
    }

    public String getPresignedUrl(String objectKey) {
        return getPresignedUrl(objectKey, 1); // preserves existing 1-hour default for submissions
    }



}