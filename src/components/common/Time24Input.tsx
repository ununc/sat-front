import { useRef, useState, ChangeEvent, FocusEvent } from "react";

interface Time24InputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Time24Input = ({
  id,
  value,
  onChange,
  className,
}: Time24InputProps) => {
  // 시간과 분을 분리
  const [hours, minutes] = value.split(":").map(String);

  // 입력 중인 상태 관리
  const [isHoursTyping, setIsHoursTyping] = useState(false);
  const [isMinutesTyping, setIsMinutesTyping] = useState(false);

  // 입력 필드 참조
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  // 숫자 입력 처리 및 제한
  const handleHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newHours = e.target.value.replace(/\D/g, ""); // 숫자만 허용

    if (isHoursTyping) {
      // 입력 중일 때는 포맷팅하지 않고 그대로 표시
      if (newHours.length > 2) newHours = newHours.slice(-2);

      // 값이 유효한지 확인
      const hourValue = parseInt(newHours, 10);
      if (newHours !== "" && (isNaN(hourValue) || hourValue > 23)) {
        newHours = "23";
      }
    } else {
      // 입력이 완료된 경우 포맷팅
      if (newHours === "") newHours = "00";
      else if (parseInt(newHours) > 23) newHours = "23";
      newHours = newHours.padStart(2, "0");
      if (newHours.length > 2) newHours = newHours.slice(-2);
    }

    const newValue = `${newHours}:${minutes}`;
    onChange(newValue);
  };

  const handleMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newMinutes = e.target.value.replace(/\D/g, ""); // 숫자만 허용

    if (isMinutesTyping) {
      // 입력 중일 때는 포맷팅하지 않고 그대로 표시
      if (newMinutes.length > 2) newMinutes = newMinutes.slice(-2);

      // 값이 유효한지 확인
      const minuteValue = parseInt(newMinutes, 10);
      if (newMinutes !== "" && (isNaN(minuteValue) || minuteValue > 59)) {
        newMinutes = "59";
      }
    } else {
      // 입력이 완료된 경우 포맷팅
      if (newMinutes === "") newMinutes = "00";
      else if (parseInt(newMinutes) > 59) newMinutes = "59";
      newMinutes = newMinutes.padStart(2, "0");
      if (newMinutes.length > 2) newMinutes = newMinutes.slice(-2);
    }

    const newValue = `${hours}:${newMinutes}`;
    onChange(newValue);
  };

  // 포커스 처리 (클릭 시 전체 선택)
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if (e.target.id === `${id}-hours`) {
      setIsHoursTyping(true);
    } else if (e.target.id === `${id}-minutes`) {
      setIsMinutesTyping(true);
    }
  };

  // 포커스를 잃었을 때 포맷팅
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (e.target.id === `${id}-hours`) {
      setIsHoursTyping(false);
      let formattedHours = e.target.value;
      if (formattedHours === "") formattedHours = "00";
      else {
        const hourValue = parseInt(formattedHours, 10);
        if (isNaN(hourValue) || hourValue > 23) formattedHours = "23";
        else formattedHours = hourValue.toString().padStart(2, "0");
      }
      onChange(`${formattedHours}:${minutes}`);
    } else if (e.target.id === `${id}-minutes`) {
      setIsMinutesTyping(false);
      let formattedMinutes = e.target.value;
      if (formattedMinutes === "") formattedMinutes = "00";
      else {
        const minuteValue = parseInt(formattedMinutes, 10);
        if (isNaN(minuteValue) || minuteValue > 59) formattedMinutes = "59";
        else formattedMinutes = minuteValue.toString().padStart(2, "0");
      }
      onChange(`${hours}:${formattedMinutes}`);
    }
  };

  // 다음 필드로 자동 이동 (시간 입력 후 분으로)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      if (minutesRef.current) {
        e.preventDefault();
        minutesRef.current.focus();
      }
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <input
        ref={hoursRef}
        type="text"
        id={`${id}-hours`}
        value={isHoursTyping ? hours.replace(/^0+/, "") : hours}
        onChange={handleHoursChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-12 p-2 border rounded text-center"
        maxLength={2}
        aria-label="시간"
      />
      <span className="mx-1 text-lg">:</span>
      <input
        ref={minutesRef}
        type="text"
        id={`${id}-minutes`}
        value={isMinutesTyping ? minutes.replace(/^0+/, "") : minutes}
        onChange={handleMinutesChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-12 p-2 border rounded text-center"
        maxLength={2}
        aria-label="분"
      />
    </div>
  );
};
