import { Student } from "@/apis/admin-menu/students";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IProps {
  showDetailDialog: boolean;
  setShowDetailDialog: React.Dispatch<React.SetStateAction<boolean>>;
  currentStudent: Student | null;
}

export const StudentDetail = ({
  showDetailDialog,
  setShowDetailDialog,
  currentStudent,
}: IProps) => {
  if (!currentStudent) return null;

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>학생 상세 정보</DialogTitle>
          <DialogDescription>학생의 모든 정보를 확인하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                학생 ID
              </h3>
              <p className="mt-1">{currentStudent.id}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                이름
              </h3>
              <p className="mt-1">{currentStudent.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                시작 시간
              </h3>
              <p className="mt-1">{currentStudent.startTime}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                종료 시간
              </h3>
              <p className="mt-1">{currentStudent.endTime}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">
              시험 정보
            </h3>
            {currentStudent.exams && currentStudent.exams.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>모듈 ID</TableHead>
                      <TableHead>응시 횟수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStudent.exams.map((exam, index) => (
                      <TableRow key={index}>
                        <TableCell>{exam.moduleUid}</TableCell>
                        <TableCell>{exam.count}회</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">시험 정보가 없습니다.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
