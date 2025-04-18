import {
  CreateStudentDto,
  requestCreateStudent,
  requestResetPasswordStudent,
  requestUpdateStudent,
  Student,
} from "@/apis/admin-menu/students";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Time24Input } from "../common/Time24Input";

interface IProps {
  newStudent: CreateStudentDto;
  setNewStudent: React.Dispatch<React.SetStateAction<CreateStudentDto>>;
  setAlert: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      missingFields: string[];
    }>
  >;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  showCreateDialog: "create" | "edit" | null;
  setShowCreateDialog: React.Dispatch<
    React.SetStateAction<"create" | "edit" | null>
  >;
}

export const StudentEdit = ({
  newStudent,
  setNewStudent,
  setAlert,
  setStudents,
  showCreateDialog,
  setShowCreateDialog,
}: IProps) => {
  const handleSave = async () => {
    const missingFields = [];
    if (!newStudent.id) missingFields.push("id");
    if (!newStudent.name) missingFields.push("name");
    if (!newStudent.startTime) missingFields.push("startTime");
    if (!newStudent.endTime) missingFields.push("endTime");

    if (missingFields.length > 0) {
      setAlert({
        show: true,
        missingFields,
      });
      return;
    }

    try {
      if (showCreateDialog === "create") {
        const data = await requestCreateStudent(newStudent);
        data.startTime = newStudent.startTime + ":00";
        data.endTime = newStudent.endTime + ":00";
        setStudents((prevStudents) => [...prevStudents, data]);
      } else {
        const data = await requestUpdateStudent(newStudent);
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.uid === data.uid ? data : student
          )
        );
      }
      setShowCreateDialog(null);
    } catch (error) {
      console.error("학생 저장 중 오류 발생:", error);
    }
  };

  const resetPassword = () => {
    setShowCreateDialog(null);
    requestResetPasswordStudent(newStudent);
  };

  const initCreateStudent = () => {
    setShowCreateDialog(null);
  };

  return (
    <Dialog
      open={showCreateDialog !== null}
      onOpenChange={(open) => {
        if (!open) setShowCreateDialog(null);
      }}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {showCreateDialog === "create" ? "새 학생 추가" : "학생 정보 수정"}
          </DialogTitle>
          <DialogDescription>
            {showCreateDialog === "create"
              ? "새로운 학생의 정보를 입력하세요"
              : "학생의 정보를 수정하세요"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              학생 ID
            </Label>
            <Input
              id="id"
              value={newStudent.id}
              onChange={(e) =>
                setNewStudent({ ...newStudent, id: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름
            </Label>
            <Input
              id="name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              로그인 시작 시간
            </Label>
            <Time24Input
              id="startTime"
              value={newStudent.startTime}
              onChange={(value) =>
                setNewStudent({ ...newStudent, startTime: value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              로그인 종료 시간
            </Label>
            <Time24Input
              id="endTime"
              value={newStudent.endTime}
              onChange={(value) =>
                setNewStudent({ ...newStudent, endTime: value })
              }
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button variant="secondary" onClick={resetPassword}>
              비밀번호 초기화
            </Button>
            <div>
              <Button
                className="mr-2"
                variant="outline"
                onClick={initCreateStudent}
              >
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
