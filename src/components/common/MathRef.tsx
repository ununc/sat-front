import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BrainCog } from "lucide-react";
import { useState } from "react";

export const MathRef = ({ isDesmosOpen }: { isDesmosOpen: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const changeOpen = () => {
    if (isDesmosOpen) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button
          className="cursor-pointer p-2 flex flex-col items-center justify-center"
          title="Toggle Reference"
        >
          <BrainCog />
          <div className="mt-1 text-sm">Reference</div>
        </button>
      </DialogTrigger>
      <DialogContent className="w-4xl">
        <DialogHeader>
          <DialogTitle>Reference</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-wrap gap-8">
          <div className="circle">
            <svg viewBox="0 0 100 100" width="100" height="100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <line
                x1="50"
                y1="50"
                x2="90"
                y2="50"
                stroke="black"
                strokeWidth="1"
              />
              <text x="70" y="45" fontSize="12">
                r
              </text>
              <circle cx="50" cy="50" r="2" fill="black" />
            </svg>
            <div className="text-center">
              <p>
                A = πr<sup>2</sup>
              </p>
              <p>C = 2πr</p>
            </div>
          </div>

          <div className="rectangle">
            <svg viewBox="0 0 100 100" width="140" height="120">
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <text x="45" y="25" fontSize="12">
                f
              </text>
              <text x="85" y="50" fontSize="12">
                w
              </text>
            </svg>
            <div className="text-center">
              <p>A = fw</p>
            </div>
          </div>

          <div>
            <svg viewBox="0 0 100 100" width="100" height="110">
              <polygon
                points="50,20 20,80 95,80"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="80"
                stroke="black"
                strokeWidth="1"
                strokeDasharray="3"
              />
              {/* 직각 표시 - 위치 조정 */}
              <path
                d="M 51,73 L 58,73 L 58,80 L 51,80 Z"
                stroke="black"
                strokeWidth="1"
                fill="#f5f5f5"
              />
              {/* 라벨 */}
              <text x="55" y="58" fontSize="12">
                h
              </text>
              <text x="50" y="95" fontSize="12">
                b
              </text>
            </svg>
            <div className="text-center">
              <p>
                A ={" "}
                <span
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      borderBottom: "1px solid black",
                      paddingBottom: "1px",
                    }}
                  >
                    1
                  </span>
                  <span style={{ display: "block" }}>2</span>
                </span>{" "}
                bh
              </p>
            </div>
          </div>

          <div className="mx-4">
            <svg viewBox="0 0 100 100" width="110" height="120">
              {/* A right-angled triangle with right angle at the bottom left */}
              <polygon
                points="20,80 90,80 20,20"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              {/* The right angle marker - larger square */}
              <path
                d="M 20,70 L 30,70 L 30,80 L 20,80 Z"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              {/* Labels */}
              <text x="10" y="50" fontSize="12">
                b
              </text>
              <text x="50" y="95" fontSize="12">
                a
              </text>
              <text x="50" y="45" fontSize="12">
                c
              </text>
            </svg>
            <div className="text-center">
              <p>
                c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup>
              </p>
            </div>
          </div>
          {/* line 2 */}
          <div>
            <svg
              viewBox="0 0 230 60"
              width="250"
              height="110"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(130,-30)">
                <polygon
                  points="20,80 80,80 20,20"
                  stroke="black"
                  stroke-width="1"
                  fill="none"
                />

                <path
                  d="M 25,80 L 25,75 L 20,75 L 20,80 Z"
                  stroke="black"
                  stroke-width="1"
                  fill="none"
                />

                <text x="30" y="48" font-size="10" text-anchor="middle">
                  45°
                </text>

                <text x="60" y="78" font-size="10" text-anchor="middle">
                  45°
                </text>

                <text x="12" y="60" font-size="10" text-anchor="middle">
                  s
                </text>
                <text x="45" y="90" font-size="10" text-anchor="middle">
                  s
                </text>
                <text x="60" y="45" font-size="10" text-anchor="middle">
                  s√2
                </text>
              </g>

              <g transform="translate(10,-29)">
                <polygon
                  points="10,80 90,80 90,20"
                  stroke="black"
                  stroke-width="1"
                  fill="none"
                />

                <path
                  d="M 85,80 L 85,75 L 90,75 L 90,80 Z"
                  stroke="black"
                  stroke-width="1"
                  fill="none"
                />

                <text x="40" y="76" font-size="10" text-anchor="middle">
                  30°
                </text>

                <text x="80" y="44" font-size="10" text-anchor="middle">
                  60°
                </text>

                <text x="98" y="56" font-size="10" text-anchor="middle">
                  x
                </text>
                <text x="50" y="94" font-size="10" text-anchor="middle">
                  x√3
                </text>
                <text x="45" y="42" font-size="10" text-anchor="middle">
                  2x
                </text>
              </g>
            </svg>
            <div className="text-center font-bold text-sm">
              Special Right Triangles
            </div>
          </div>

          <div className="mx-5">
            <svg viewBox="38 0 50 100" width="110" height="100">
              <polygon
                points="20,70 80,70 80,30 20,30"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <polygon
                points="20,30 35,15 95,15 80,30"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <polygon
                points="80,30 95,15 95,55 80,70"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />

              <text x="50" y="85" fontSize="12" textAnchor="middle">
                ℓ
              </text>

              <text x="94" y="70" fontSize="12" textAnchor="middle">
                w
              </text>

              <text x="102" y="40" fontSize="12" textAnchor="middle">
                h
              </text>
            </svg>
            <div className="text-center">
              <p>V = ℓwh</p>
            </div>
          </div>
          <div className="mr-40">
            <svg viewBox="22 0 110 80" width="110" height="85">
              <ellipse
                cx="75"
                cy="35"
                rx="35"
                ry="10"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <line
                x1="40"
                y1="35"
                x2="40"
                y2="65"
                stroke="black"
                strokeWidth="1"
              />

              <line
                x1="110"
                y1="35"
                x2="110"
                y2="65"
                stroke="black"
                strokeWidth="1"
              />
              <path
                d="M 40 65 A 35 10 0 0 0 110 65"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <line
                x1="75"
                y1="35"
                x2="99.75"
                y2="27.93"
                stroke="black"
                strokeWidth="1"
              />
              <text x="94" y="40" fontSize="14" textAnchor="middle">
                r
              </text>
              <text x="118" y="55" fontSize="12" textAnchor="middle">
                h
              </text>
            </svg>

            <div className="text-center mt-3">
              <p className="text-lg">V = πr²h</p>
            </div>
          </div>

          {/* line3 */}
          <div>
            <div className="flex justify-center mb-4">
              <svg viewBox="0 0 100 100" width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="40"
                  ry="10"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="3"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="90"
                  y2="50"
                  stroke="black"
                  strokeWidth="1"
                />
                <circle cx="50" cy="50" r="2" fill="black" />
                <text x="66" y="44" fontSize="16">
                  r
                </text>
              </svg>
            </div>
            <div className="text-center">
              <p>
                V ={" "}
                <div
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>4</div>
                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid black",
                    }}
                  >
                    3
                  </div>
                </div>
                πr<sup>3</sup>
              </p>
            </div>
          </div>

          {/* Cone */}
          <div className="mx-8">
            <svg viewBox="0 5 100 110" width="100" height="110">
              <ellipse
                cx="50"
                cy="90"
                rx="30"
                ry="10"
                stroke="black"
                strokeWidth="1"
                fill="none"
              />
              <line
                x1="50"
                y1="20"
                x2="20"
                y2="90"
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="20"
                x2="80"
                y2="90"
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="90"
                stroke="black"
                strokeWidth="1"
                strokeDasharray="3"
              />
              <line
                x1="50"
                y1="90"
                x2="80"
                y2="90"
                stroke="black"
                strokeWidth="1"
                strokeDasharray="3"
              />
              <text x="55" y="65" fontSize="14">
                h
              </text>
              <text x="65" y="93" fontSize="14">
                r
              </text>
            </svg>
            <div className="text-center mt-1">
              <p>
                V ={" "}
                <div
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>1</div>
                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid black",
                      paddingTop: "2px",
                    }}
                  >
                    3
                  </div>
                </div>
                πr<sup>2</sup>h
              </p>
            </div>
          </div>

          <div className="pt-3">
            <svg
              width="100"
              height="100"
              viewBox="14 0 900 900"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M292.504 435.5 895.1 435.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-dasharray="27.5 20.625"
                  fill="none"
                />

                <path
                  d="M9.27 703.418 375.5 4.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M375.5 4.5 615.87 703.42"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M7.5 703.5 617.77 703.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M612.5 707.444 898.832 436.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M375.5 4.5 898.86 436.65"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M375.5 4.5 287.922 436.65"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-dasharray="27.5 20.625"
                  fill="none"
                />

                <path
                  d="M9.497 709.182 292.49 435.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-dasharray="27.5 20.625"
                  fill="none"
                />

                <path
                  d="M378.5 4.5 378.5 538.52"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M382.5 494.5 418.45 494.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <path
                  d="M417.5 538.21 417.5 494.5"
                  stroke="#000000"
                  stroke-width="6.875"
                  stroke-linecap="butt"
                  stroke-linejoin="miter"
                  stroke-miterlimit="8"
                  fill="none"
                />

                <text x="300" y="870" font-size="150">
                  ℓ
                </text>

                <text x="810" y="660" font-size="140">
                  w
                </text>

                <text x="400" y="380" font-size="130">
                  h
                </text>
              </g>
            </svg>

            <div className="text-center">
              <p>
                V ={" "}
                <div
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>1</div>
                  <div
                    style={{
                      textAlign: "center",
                      borderTop: "1px solid black",
                    }}
                  >
                    3
                  </div>
                </div>
                ℓwh
              </p>
            </div>
          </div>

          <div className="w-full px-2 space-y-1.5">
            <div>
              The number of degrees of arc in a circle is 360. The number of
            </div>
            <div>
              radians of arc in a circle is 2π. The sum of the measures in
            </div>
            <div>degrees of the angles of a triangle is 180.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
