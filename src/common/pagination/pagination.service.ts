import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page = 1,
    limit = 20,
    query?: SelectQueryBuilder<T>,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    let data: T[];
    let total: number;

    if (query) {
      [data, total] = await query.skip(skip).take(limit).getManyAndCount();
    } else {
      [data, total] = await repository.findAndCount({ skip, take: limit });
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}