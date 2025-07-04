import {
  type CreateModuleDto,
  requestGetModules,
  type Module,
  requestDeleteModule,
} from "@/apis/module";
import MDetail from "@/components/module/MDetail";
import { MEdit } from "@/components/module/MEdit";
import { MFilter } from "@/components/module/MFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  EyeIcon,
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

export const ModulePage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState<
    "create" | "edit" | null
  >(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInDescription, setSearchInDescription] = useState(false);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [modules, setModules] = useState<Module[]>([]);
  const [deleteItem, setDeleteItem] = useState<{
    title: string;
    uid: string;
  } | null>(null);

  const [newModule, setNewModule] = useState<CreateModuleDto>({
    title: "",
    section: "",
    level: 3,
    description: "",
    questions: [],
  });

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    missingFields: [],
  });

  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const navigate = useNavigate();

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      title: "제목",
      section: "섹션",
      level: "레벨",
    };

    return fieldMap[field] || field;
  };

  const handleViewDetail = (module: Module) => {
    setCurrentModule(module);
    setShowDetailDialog(true);
  };

  const handleEdit = (module: Module) => {
    const moduleWithQuestionIds = {
      ...module,
      // questions 배열의 각 Question 객체에서 uid만 추출
      questions: module.questions.map((question) => question.uid),
    };
    setNewModule(moduleWithQuestionIds);
    setShowCreateDialog("edit");
  };

  const handleDelete = (module: Module) => {
    setDeleteItem({
      title: module.title,
      uid: module.uid,
    });
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleClickDelete = async () => {
    if (!deleteItem) return;
    await requestDeleteModule(deleteItem.uid);
    setModules((prevModules) =>
      prevModules.filter((module) => module.uid !== deleteItem.uid)
    );
    setDeleteItem(null);
  };

  const filteredAndSortedModules = modules
    .filter((module) => {
      // 검색어 필터링
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (searchInTitle &&
          module.title.toLowerCase().includes(searchTermLower)) ||
        (searchInDescription &&
          module.description.toLowerCase().includes(searchTermLower));

      // 섹션 필터링
      const matchesSection =
        filterSection === "all" ? true : module.section === filterSection;

      // 난이도 필터링
      const matchesLevel =
        filterLevel === "all" ? true : module.level === parseInt(filterLevel);

      return matchesSearch && matchesSection && matchesLevel;
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
        const data = await requestGetModules();
        setModules(data);
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
          <h1 className="text-3xl font-bold mb-2">모듈 관리</h1>
          <p className="text-muted-foreground">
            모듈을 생성하고 수정하며, 목록을 확인하고 검색하세요
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog("create")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          모듈 생성하기
        </Button>
      </div>

      <MFilter
        setSearchTerm={setSearchTerm}
        setSearchInTitle={setSearchInTitle}
        setSearchInDescription={setSearchInDescription}
        setFilterSection={setFilterSection}
        setFilterLevel={setFilterLevel}
        setSortOrder={setSortOrder}
        searchTerm={searchTerm}
        searchInTitle={searchInTitle}
        searchInDescription={searchInDescription}
        filterSection={filterSection}
        filterLevel={filterLevel}
        sortOrder={sortOrder}
        modules={modules}
      />

      <MEdit
        newModule={newModule}
        setNewModule={setNewModule}
        setAlert={setAlert}
        setModules={setModules}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
      />

      <Card>
        <CardHeader>
          <CardTitle>모듈 목록</CardTitle>
          <CardDescription>
            총 {filteredAndSortedModules.length}개의 모듈이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">섹션</TableHead>
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
                {filteredAndSortedModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedModules.map((module) => (
                    <TableRow key={module.uid}>
                      <TableCell>{module.section}</TableCell>
                      <TableCell>{module.title}</TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < module.level ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(module.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(module)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(module)}
                        >
                          <Edit3Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(module)}
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

      <MDetail
        showDetailDialog={showDetailDialog}
        setShowDetailDialog={setShowDetailDialog}
        currentModule={currentModule}
      />

      {deleteItem && (
        <AlertDialog
          open={deleteItem !== null}
          onOpenChange={() => setDeleteItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>모듈 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold">{deleteItem.title}</span> 모듈을
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
