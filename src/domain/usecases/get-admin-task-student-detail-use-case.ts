import type { AdminTaskStudentDetail } from "@/domain/services/learning-task-service";
import type { LearningTaskService } from "@/domain/services/learning-task-service";

export class GetAdminTaskStudentDetailUseCase {
  constructor(private readonly service: LearningTaskService) {}

  execute(taskId: string, studentId: string): Promise<AdminTaskStudentDetail | null> {
    return this.service.getAdminTaskStudentDetail(taskId, studentId);
  }
}
