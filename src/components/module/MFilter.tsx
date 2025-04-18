import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import type { Module } from "@/apis/module";

interface IProps {
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSearchInTitle: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchInDescription: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterSection: React.Dispatch<React.SetStateAction<string>>;
  setFilterLevel: React.Dispatch<React.SetStateAction<string>>;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  modules: Module[];
  searchTerm: string;
  searchInTitle: boolean;
  searchInDescription: boolean;
  filterSection: string;
  filterLevel: string;
  sortOrder: string;
}

export const MFilter = ({
  setSearchTerm,
  setSearchInTitle,
  setSearchInDescription,
  setFilterSection,
  setFilterLevel,
  setSortOrder,
  modules,
  searchTerm,
  searchInTitle,
  searchInDescription,
  filterSection,
  filterLevel,
  sortOrder,
}: IProps) => {
  const uniqueSections = Array.from(new Set(modules.map((q) => q.section)));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>검색 및 필터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 검색 영역 */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="searchTitle-module"
                  checked={searchInTitle}
                  onCheckedChange={() => setSearchInTitle(!searchInTitle)}
                />
                <Label htmlFor="searchTitle-module">제목에서 검색</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="searchDescription-module"
                  checked={searchInDescription}
                  onCheckedChange={() =>
                    setSearchInDescription(!searchInDescription)
                  }
                />
                <Label htmlFor="searchDescription-module">설명에서 검색</Label>
              </div>
            </div>
          </div>

          {/* 필터 및 정렬 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterSection">섹션별 필터</Label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger id="filterSection">
                  <SelectValue placeholder="모든 섹션" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 섹션</SelectItem>
                  {uniqueSections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterLevel">난이도별 필터</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger id="filterLevel">
                  <SelectValue placeholder="모든 난이도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 난이도</SelectItem>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">정렬 방식</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sortOrder">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">최신순 (내림차순)</SelectItem>
                  <SelectItem value="asc">오래된순 (오름차순)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSearchInTitle(true);
                  setSearchInDescription(false);
                  setFilterSection("all");
                  setFilterLevel("all");
                  setSortOrder("desc");
                }}
                className="w-full"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
