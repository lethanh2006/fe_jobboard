"use client";

import { type KeyboardEvent, useId, useState } from "react";

type SkillInputProps = {
  label: string;
  value: string[];
  onChange: (skills: string[]) => void;
  max: number;
  suggestions?: string[];
  hint?: string;
};

/** Nhập kỹ năng dạng thẻ: Enter hoặc dấu phẩy để thêm, Backspace để xóa thẻ cuối. */
export function SkillInput({
  label,
  value,
  onChange,
  max,
  suggestions = [],
  hint,
}: SkillInputProps) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const reachedLimit = value.length >= max;

  function addSkills(raw: string) {
    const next = [...value];
    for (const part of raw.split(",")) {
      const skill = part.trim().slice(0, 50);
      if (
        skill &&
        next.length < max &&
        !next.some((item) => item.toLowerCase() === skill.toLowerCase())
      ) {
        next.push(skill);
      }
    }

    onChange(next);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkills(draft);
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="skill-input">
      <span className="skill-input-label">{label}</span>
      <div className="skill-input-box">
        {value.map((skill) => (
          <span className="skill-chip" key={skill}>
            {skill}
            <button
              type="button"
              aria-label={`Xóa kỹ năng ${skill}`}
              onClick={() => onChange(value.filter((item) => item !== skill))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          list={listId}
          disabled={reachedLimit}
          placeholder={reachedLimit ? "Đã đạt giới hạn" : "Nhập kỹ năng rồi nhấn Enter"}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft.trim() && addSkills(draft)}
          maxLength={50}
        />
        <datalist id={listId}>
          {suggestions
            .filter((suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()))
            .map((suggestion) => (
              <option value={suggestion} key={suggestion} />
            ))}
        </datalist>
      </div>
      <small>
        {hint ?? "Phân tách bằng Enter hoặc dấu phẩy."} Đã chọn {value.length}/{max}.
      </small>
    </div>
  );
}
