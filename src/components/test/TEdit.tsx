import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
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
  ArrowUpDown,
  Check,
  Clock,
  EyeIcon,
  ListOrderedIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Module, requestGetModules } from "@/apis/module";
import {
  requestCreateTest,
  requestUpdateTest,
  Test,
  type CreateTestDto,
  type Order,
} from "@/apis/test";
import { MFilter } from "../module/MFilter";
import MDetail from "../module/MDetail";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

interface IProps {
  newTest: CreateTestDto;
  setNewTest: React.Dispatch<React.SetStateAction<CreateTestDto>>;
  setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  showCreateDialog: "create" | "edit" | null;
  setShowCreateDialog: React.Dispatch<
    React.SetStateAction<"create" | "edit" | null>
  >;
}

export const TEdit = ({
  newTest,
  setNewTest,
  setAlert,
  setTests,
  showCreateDialog,
  setShowCreateDialog,
}: IProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [modules, setModules] = useState<Module[]>([]);

  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInDescription, setSearchInDescription] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleNewTestChange = (field: string, value: string | number) => {
    setNewTest({
      ...newTest,
      [field]: value,
    });
  };

  const validateForm = () => {
    const requiredFields = ["title", "level"];
    const missingFields = requiredFields.filter(
      (field) => !newTest[field as keyof typeof newTest]
    );

    const hasEmptyOrder = newTest.order.length === 0;

    return {
      missingFields,
      hasEmptyOrder,
    };
  };

  const handleCreateTest = async () => {
    const { missingFields, hasEmptyOrder } = validateForm();

    if (missingFields.length > 0 || hasEmptyOrder) {
      const alertMessage = [];

      if (missingFields.length > 0) {
        alertMessage.push(...missingFields);
      }

      if (hasEmptyOrder) {
        alertMessage.push("시험 순서가 설정되지 않았습니다.");
      }

      setAlert({
        show: true,
        missingFields: alertMessage,
      });

      setTimeout(() => {
        setAlert({ show: false, missingFields: [] });
      }, 5000);
      return;
    }
    const payload = { ...newTest };
    payload.examModules = newTest.order
      .map((item) => item.moduleUid)
      .filter((uid) => uid);
    try {
      if (showCreateDialog === "create") {
        const data = await requestCreateTest(payload);
        setTests((prevTests) => [...prevTests, data]);
      } else {
        const data = await requestUpdateTest(payload);
        setTests((prevTests) =>
          prevTests.map((test) => (test.uid === data.uid ? data : test))
        );
      }
      initCreateTest();
    } catch {
      console.error("시험 생성 실패");
    }
  };

  const initCreateTest = () => {
    setShowCreateDialog(null);
    setNewTest({
      title: "",
      description: "",
      level: 3,
      order: [],
      examModules: [],
    });
  };

  const handleSelectModule = (uid: string) => {
    const moduleOrder: Order = {
      kind: "module",
      time: "30:00",
      moduleUid: uid,
    };

    setNewTest({
      ...newTest,
      order: [...newTest.order, moduleOrder],
    });
  };

  const handleViewDetail = (module: Module) => {
    setCurrentModule(module);
    setShowDetailDialog(true);
  };

  const handleAddBreakTime = () => {
    const breakOrder: Order = {
      kind: "break",
      time: "10:00",
      moduleUid: "",
    };

    setNewTest({
      ...newTest,
      order: [...newTest.order, breakOrder],
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    const updatedOrder = [...newTest.order];
    updatedOrder.splice(index, 1);

    setNewTest({
      ...newTest,
      order: updatedOrder,
    });
  };

  const handleChangeMin = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    const minValue = Math.min(parseInt(value) || 0, 120);
    const updatedOrder = [...newTest.order];
    const originalTime = updatedOrder[index].time;
    const sec = originalTime.split(":")[1];
    updatedOrder[index].time = `${minValue.toString().padStart(2, "0")}:${sec}`;
    setNewTest({
      ...newTest,
      order: updatedOrder,
    });
  };

  const handleFocus = (
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
  ) => {
    (event.target as HTMLInputElement).select();
  };

  const handleChangeSec = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    const secValue = Math.min(parseInt(value) || 0, 59);
    const updatedOrder = [...newTest.order];
    const originalTime = updatedOrder[index].time;
    const min = originalTime.split(":")[0];
    updatedOrder[index].time = `${min}:${secValue.toString().padStart(2, "0")}`;
    setNewTest({
      ...newTest,
      order: updatedOrder,
    });
  };

  const moveOrderItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= newTest.order.length) return;
    const updatedOrder = [...newTest.order];
    const [movedItem] = updatedOrder.splice(fromIndex, 1);
    updatedOrder.splice(toIndex, 0, movedItem);
    setNewTest({
      ...newTest,
      order: updatedOrder,
    });
  };

  useEffect(() => {
    if (showCreateDialog === null) return;
    (async () => {
      try {
        const moduleData = await requestGetModules();
        setModules(moduleData);
      } catch (error) {
        console.error("모듈을 가져오는 중 오류 발생:", error);
      }
    })();
  }, [showCreateDialog]);

  const getModuleById = (uid: string) => {
    return modules.find((module) => module.uid === uid)?.title || "";
  };

  const filteredAndSortedModules = modules
    .filter((module) => {
      const isAlreadySelected = newTest.order.find(
        (item) => item.moduleUid === module.uid
      );
      if (isAlreadySelected) return false;
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (searchInTitle &&
          module.title.toLowerCase().includes(searchTermLower)) ||
        (searchInDescription &&
          module.description.toLowerCase().includes(searchTermLower));

      const matchesSection =
        filterSection === "all" ? true : module.section === filterSection;

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

  return (
    <Dialog open={Boolean(showCreateDialog)} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {showCreateDialog === "create" ? "새 시험 생성" : "시함 수정"}
          </DialogTitle>
          <div>
            <Button className="mr-2" variant="outline" onClick={initCreateTest}>
              취소
            </Button>
            <Button onClick={handleCreateTest}>
              시험 {showCreateDialog === "create" ? "생성" : "수정"}
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-4 max-h-[70vh] p-1 overflow-y-auto">
          {/* 시험 기본 정보 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={newTest.title}
              onChange={(e) => handleNewTestChange("title", e.target.value)}
              placeholder="시험 제목"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={newTest.description}
              onChange={(e) =>
                handleNewTestChange("description", e.target.value)
              }
              placeholder="시험 설명"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">난이도 *</Label>
            <Select
              value={newTest.level.toString()}
              onValueChange={(value) =>
                handleNewTestChange("level", parseInt(value))
              }
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="난이도 선택" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} / 5
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 시험 순서 표시 */}
          <Card>
            <CardHeader>
              <CardTitle>시험 구성</CardTitle>
              <CardDescription>
                시험에 포함된 모듈과 휴식 시간의 순서입니다. 순서를 변경하려면
                드래그하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newTest.order.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  모듈을 추가하거나 휴식 시간을 설정하세요.
                </div>
              ) : (
                <div className="space-y-2">
                  {newTest.order.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      {item.kind === "module" ? (
                        <div className="flex flex-1 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ListOrderedIcon className="h-4 w-4 text-primary" />
                            <span>{getModuleById(item.moduleUid)}</span>
                          </div>

                          <div className="flex gap-1">
                            <div className="flex items-center mr-2">
                              <Input
                                type="number"
                                min="0"
                                value={item.time.split(":")[0]}
                                onChange={(event) =>
                                  handleChangeMin(event, index)
                                }
                                onFocus={handleFocus}
                                onClick={handleFocus}
                                className="w-14 mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div className="mr-1">분</div>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={item.time.split(":")[1]}
                                onChange={(event) =>
                                  handleChangeSec(event, index)
                                }
                                onFocus={handleFocus}
                                onClick={handleFocus}
                                className="w-12 mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div>초</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOrderItem(index, index - 1)}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOrderItem(index, index + 1)}
                              disabled={index === newTest.order.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOrderItem(index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Break Time</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="flex items-center mr-2">
                              <Input
                                type="number"
                                min="0"
                                value={item.time.split(":")[0]}
                                onChange={(event) =>
                                  handleChangeMin(event, index)
                                }
                                onFocus={handleFocus}
                                onClick={handleFocus}
                                className="w-14 mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div className="mr-1">분</div>
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                value={item.time.split(":")[1]}
                                onChange={(event) =>
                                  handleChangeSec(event, index)
                                }
                                onFocus={handleFocus}
                                onClick={handleFocus}
                                className="w-12 mr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div>초</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOrderItem(index, index - 1)}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveOrderItem(index, index + 1)}
                              disabled={index === newTest.order.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOrderItem(index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 휴식 시간 추가 */}
              <div className="flex justify-end items-center gap-4 mt-4">
                <Button variant="secondary" onClick={handleAddBreakTime}>
                  휴식 시간 추가
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 모듈 검색 및 필터링 */}
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
          <Card>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>섹션</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>난이도</TableHead>
                      <TableHead>문제 수</TableHead>
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
                      <TableHead className="w-20 text-center">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedModules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedModules.map((module) => {
                        return (
                          <TableRow key={module.uid}>
                            <TableCell>{module.section}</TableCell>
                            <TableCell className="font-medium">
                              {module.title}
                            </TableCell>
                            <TableCell>{module.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`w-2 h-2 rounded-full mr-1 ${
                                      i < module.level
                                        ? "bg-primary"
                                        : "bg-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{module.questions.length}</TableCell>
                            <TableCell>
                              {new Date(module.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                className="mr-2"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetail(module)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSelectModule(module.uid)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <MDetail
          showDetailDialog={showDetailDialog}
          setShowDetailDialog={setShowDetailDialog}
          currentModule={currentModule}
        />
      </DialogContent>
    </Dialog>
  );
};
