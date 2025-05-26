import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
  
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;

    const transformed = {};
    
    for (const [key, val] of Object.entries(value)) {
        try {
          transformed[key] = typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
          // Handle numeric strings
        if (typeof val === 'string' && !isNaN(Number(val))) {
            transformed[key] = Number(val);
          } else {
            transformed[key] = val;
          }
        }
    }
    return transformed;
  }
}