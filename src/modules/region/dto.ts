// src/modules/region/dto.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRegionDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tên khu vực mới
 *           example: "Đà Nẵng"
 *
 *     UpdateRegionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Tên khu vực cập nhật
 *           example: "Đà Nẵng - Quảng Nam"
 */

export interface CreateRegionDto {
  name: string;
}

export interface UpdateRegionDto {
  name?: string;
}