import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ClipboardPlus,
  Edit3Icon,
  PlusCircle,
  Trash,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  CreateStudentDto,
  Exams,
  requestDeleteStudent,
  requestGetStudents,
  Student,
} from "@/apis/admin-menu/students";
import { StudentEdit } from "@/components/student/StudentEdit";
import { ExamEdit } from "@/components/student/ExamEdit";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

export const StudentPage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState<
    "create" | "edit" | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [students, setStudents] = useState<Student[]>([]);
  const [deleteItem, setDeleteItem] = useState<{
    title: string;
    uid: string;
  } | null>(null);
  const [newStudent, setNewStudent] = useState<CreateStudentDto>({
    id: "",
    name: "",
    startTime: "16:00",
    endTime: "20:00",
    role: "student",
    exams: [],
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    missingFields: [],
  });
  const [showEditExam, setShowEditExam] = useState<Student | null>(null);
  const [newStudentExam, setNewStudentExam] = useState<Exams[]>([]);

  const navigate = useNavigate();

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      id: "학생 ID",
      name: "이름",
      startTime: "시작 시간",
      endTime: "종료 시간",
    };

    return fieldMap[field] || field;
  };

  const handleEdit = (student: Student) => {
    const item = {
      ...student,
      endTime: student.endTime.slice(0, -3),
      startTime: student.startTime.slice(0, -3),
    };
    setNewStudent(item);
    setShowCreateDialog("edit");
  };

  const handleOpenExamSetting = (student: Student) => {
    const newExams = student.exams.map((item) => ({
      ...item,
    }));
    setShowEditExam(student);
    setNewStudentExam(newExams);
  };

  const handleDelete = (student: Student) => {
    setDeleteItem({
      title: student.name,
      uid: student.uid,
    });
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleClickDelete = async () => {
    if (!deleteItem) return;
    await requestDeleteStudent(deleteItem.uid);
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.uid !== deleteItem.uid)
    );
    setDeleteItem(null);
  };

  const handleAddNew = () => {
    setShowCreateDialog("create");
    setNewStudent({
      id: "",
      name: "",
      startTime: "16:00",
      endTime: "20:00",
      role: "student",
      exams: [],
    });
  };

  const filteredAndSortedStudents = students
    .filter((student) => {
      // 검색어 필터링
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(searchTermLower) ||
        student.id.toLowerCase().includes(searchTermLower);

      return matchesSearch;
    })
    .sort((a, b) => {
      // 생성일 기준 정렬
      if (sortOrder === "asc") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  useEffect(() => {
    (async () => {
      try {
        const data = await requestGetStudents();
        setStudents(data);
      } catch (error) {
        console.error("학생 데이터를 가져오는 중 오류 발생:", error);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto pt-4 pb-8 px-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="flex items-center mb-4 gap-1 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로가기
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">학생 관리</h1>
          <p className="text-muted-foreground">
            학생을 추가, 편집, 검색하고 관리하세요
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          학생 추가하기
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
          <CardDescription>
            이름 또는 ID로 학생을 검색하고 다양한 기준으로 필터링하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="search" className="mb-2 block">
              검색어
            </Label>
            <Input
              id="search"
              placeholder="이름 또는 ID로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <StudentEdit
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        setAlert={setAlert}
        setStudents={setStudents}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
      />

      <ExamEdit
        newStudentExam={newStudentExam}
        setNewStudentExam={setNewStudentExam}
        showEditExam={showEditExam}
        setShowEditExam={setShowEditExam}
        setStudents={setStudents}
      />

      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
          <CardDescription>
            총 {filteredAndSortedStudents.length}명의 학생이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학생 ID</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead className="w-32">로그인 가능 시간</TableHead>
                  <TableHead className="w-28">
                    <div className="flex items-center">
                      생성일
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="ml-1 h-5 w-5"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-22 text-center">시험 설정</TableHead>
                  <TableHead className="w-28 text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedStudents.map((student) => (
                    <TableRow key={student.uid}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        {student.startTime.slice(0, -3)} -{" "}
                        {student.endTime.slice(0, -3)}
                      </TableCell>

                      <TableCell>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenExamSetting(student)}
                        >
                          <ClipboardPlus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit3Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {deleteItem && (
        <AlertDialog
          open={deleteItem !== null}
          onOpenChange={() => setDeleteItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>학생 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold">{deleteItem.title}</span> 학생을
                정말 삭제하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleClickDelete}
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {alert.show && (
        <div className="fixed top-4 right-4 z-[100] w-80 shadow-lg">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="flex items-start justify-between w-full">
              <div>
                <AlertTitle className="text-destructive">입력 오류</AlertTitle>
                <AlertDescription>
                  다음 필수 필드를 입력해주세요:
                  <ul className="mt-2 list-disc list-inside">
                    {alert.missingFields.map((field) => (
                      <li key={field}>{getFieldDisplayName(field)}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={() => setAlert({ show: false, missingFields: [] })}
              >
                <X size={16} />
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};
