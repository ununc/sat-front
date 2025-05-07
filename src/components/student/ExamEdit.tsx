import {
  Exams,
  requestUpdateStudentExam,
  Student,
} from "@/apis/admin-menu/students";
import { Button } from "../ui/button";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState } from "react";
import { requestGetTests, Test } from "@/apis/test";
import { TFilter } from "../test/TFilter";
import { ArrowUpDown, Minus, Plus } from "lucide-react";
import { Input } from "../ui/input";

interface IProps {
  newStudentExam: Exams[];
  setNewStudentExam: React.Dispatch<React.SetStateAction<Exams[]>>;
  showEditExam: Student | null;
  setShowEditExam: React.Dispatch<React.SetStateAction<Student | null>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const ExamEdit = ({
  newStudentExam,
  setNewStudentExam,
  showEditExam,
  setShowEditExam,
  setStudents,
}: IProps) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInDescription, setSearchInDescription] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // 시험을 학생 시험에 추가
  const addTestToExams = (test: Test) => {
    setNewStudentExam((prev) => [...prev, { testId: test.uid, count: 1 }]);
  };

  // 시험 횟수 업데이트
  const updateExamCount = (testId: string, count: number) => {
    if (count < 1) count = 1; // 최소 1회 보장
    setNewStudentExam((prev) =>
      prev.map((exam) => (exam.testId === testId ? { ...exam, count } : exam))
    );
  };

  // 시험 제거
  const removeExam = (testId: string) => {
    setNewStudentExam((prev) => prev.filter((exam) => exam.testId !== testId));
  };

  const handleSettingTest = async () => {
    const newStudent = {
      ...showEditExam,
      exams: newStudentExam,
      endTime: showEditExam!.endTime.slice(0, -3),
      startTime: showEditExam!.startTime.slice(0, -3),
    };
    const data = await requestUpdateStudentExam(newStudent as Student);
    setStudents((prevStudents) =>
      prevStudents.map((student) => (student.uid === data.uid ? data : student))
    );
    setShowEditExam(null);
  };

  const filteredAndSortedTests = tests
    .filter((test) => {
      const isAlreadySelected = newStudentExam.find(
        (item) => item.testId === test.uid
      );
      if (isAlreadySelected) return false;
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (searchInTitle && test.title.toLowerCase().includes(searchTermLower)) ||
        (searchInDescription &&
          test.description.toLowerCase().includes(searchTermLower));

      // 난이도 필터링
      const matchesLevel =
        filterLevel === "all" ? true : test.level === parseInt(filterLevel);

      return matchesSearch && matchesLevel;
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

  const selectedExamsWithDetails = newStudentExam.map((exam) => {
    const testDetails = tests.find((test) => test.uid === exam.testId);
    return {
      ...exam,
      testDetails,
    };
  });

  useEffect(() => {
    if (showEditExam === null) return;
    (async () => {
      try {
        const moduleData = await requestGetTests();
        setTests(moduleData);
      } catch (error) {
        console.error("모듈을 가져오는 중 오류 발생:", error);
      }
    })();
  }, [showEditExam]);

  return (
    <Dialog open={Boolean(showEditExam)} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{showEditExam?.name} 학생 시험 설정</DialogTitle>
          <div>
            <Button
              className="mr-2"
              variant="outline"
              onClick={() => {
                setShowEditExam(null);
              }}
            >
              취소
            </Button>
            <Button onClick={handleSettingTest}>설정</Button>
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] p-1 overflow-y-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{showEditExam?.name} 학생에게 할당된 시험</CardTitle>
              <CardDescription>
                현재 {newStudentExam.length}개의 시험이 할당되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>난이도</TableHead>
                      <TableHead className="w-32">횟수</TableHead>
                      <TableHead className="w-20">삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExamsWithDetails.map((exam) => {
                      if (!exam.testDetails) {
                        return;
                      }
                      return (
                        <TableRow key={exam.testId}>
                          <TableCell className="font-medium">
                            {exam.testDetails?.title || "알 수 없는 시험"}
                          </TableCell>
                          <TableCell>{exam.testDetails?.description}</TableCell>

                          <TableCell>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    i < exam.testDetails!.level
                                      ? "bg-primary"
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateExamCount(exam.testId, exam.count - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={exam.count}
                                onChange={(e) =>
                                  updateExamCount(
                                    exam.testId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="h-8 w-16 mx-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateExamCount(exam.testId, exam.count + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeExam(exam.testId)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <TFilter
            setSearchTerm={setSearchTerm}
            setSearchInTitle={setSearchInTitle}
            setSearchInDescription={setSearchInDescription}
            setFilterLevel={setFilterLevel}
            setSortOrder={setSortOrder}
            searchTerm={searchTerm}
            searchInTitle={searchInTitle}
            filterLevel={filterLevel}
            searchInDescription={searchInDescription}
            sortOrder={sortOrder}
          />

          <Card>
            <CardHeader>
              <CardTitle>시험 목록</CardTitle>
              <CardDescription>
                총 {filteredAndSortedTests.length}개의 시험이 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="w-28">난이도</TableHead>
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
                      <TableHead className="w-20">추가</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedTests.map((test) => (
                        <TableRow key={test.uid}>
                          <TableCell className="font-medium">
                            {test.title}
                          </TableCell>
                          <TableCell>{test.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    i < test.level ? "bg-primary" : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(test.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTestToExams(test)}
                            >
                              추가
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
