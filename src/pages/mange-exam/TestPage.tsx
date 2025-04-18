import {
  CreateTestDto,
  requestDeleteTest,
  requestGetTests,
  Test,
} from "@/apis/test";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TEdit } from "@/components/test/TEdit";
import { TFilter } from "@/components/test/TFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  Edit3Icon,
  PlusCircle,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

export const TestPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInDescription, setSearchInDescription] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [tests, setTests] = useState<Test[]>([]);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    missingFields: [],
  });
  const [newTest, setNewTest] = useState<CreateTestDto>({
    title: "",
    description: "",
    level: 3,
    order: [],
    examModules: [],
  });

  const [showCreateDialog, setShowCreateDialog] = useState<
    "create" | "edit" | null
  >(null);
  const [deleteItem, setDeleteItem] = useState<{
    title: string;
    uid: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleEdit = (test: Test) => {
    setNewTest(test);
    setShowCreateDialog("edit");
  };

  const handleDelete = (module: Test) => {
    setDeleteItem({
      title: module.title,
      uid: module.uid,
    });
  };

  const handleClickDelete = async () => {
    if (!deleteItem) return;
    await requestDeleteTest(deleteItem.uid);
    setTests((prevModules) =>
      prevModules.filter((module) => module.uid !== deleteItem.uid)
    );
    setDeleteItem(null);
  };

  const handleBack = () => {
    navigate("/");
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      title: "제목",
      level: "레벨",
      order: "모듈 순서",
    };

    return fieldMap[field] || field;
  };

  const filteredAndSortedTests = tests
    .filter((test) => {
      // 검색어 필터링
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

  useEffect(() => {
    (async () => {
      try {
        const data = await requestGetTests();
        setTests(data);
      } catch (error) {
        console.error("질문을 가져오는 중 오류 발생:", error);
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
          <h1 className="text-3xl font-bold mb-2">시험 관리</h1>
          <p className="text-muted-foreground">
            시험을 생성하고 수정하며, 목록을 확인하고 검색하세요
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog("create")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          시험 생성하기
        </Button>
      </div>
      {/* 검색 및 필터 영역 */}
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

      <TEdit
        newTest={newTest}
        setNewTest={setNewTest}
        setAlert={setAlert}
        setTests={setTests}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
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
                  <TableHead className="w-24 text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                      <TableCell className="text-right">
                        <Button
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(test)}
                        >
                          <Edit3Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(test)}
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
              <AlertDialogTitle>시함 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold">{deleteItem.title}</span> 시험을
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
