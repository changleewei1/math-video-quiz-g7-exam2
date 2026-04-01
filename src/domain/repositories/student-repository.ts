import type { Student } from "@/domain/entities";

export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  findByStudentCode(code: string): Promise<Student | null>;
  findAll(): Promise<Student[]>;
  findByClassName(className: string): Promise<Student[]>;
}
