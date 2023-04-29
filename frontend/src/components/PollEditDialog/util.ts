import { PollOptionType } from "__generated__/globalTypes";
import { OptionEditorType } from "./OptionEditor";
import { useEffect, useState } from "react";

const linkFromTitle = (title?: string) => {
  if (!title) return "";
  return (
    Math.random().toString(36).slice(2, 6) + //some entropy
    "-" +
    title
      .replaceAll(" ", "-")
      .replaceAll("ä", "ae")
      .replaceAll("Ä", "AE")
      .replaceAll("ö", "oe")
      .replaceAll("Ö", "OE")
      .replaceAll("ü", "ue")
      .replaceAll("Ü", "UE")
      .replaceAll(/(?![\w-])./g, "")
  );
};

const useWindowOrigin = () => {
  const [origin, setOrigin] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin)
      setOrigin(window.location.origin);
    else setOrigin("");
  }, []);
  return origin;
};

const mapOptionTypeToEditorType = (t?: PollOptionType) => {
  if (t == PollOptionType.Arbitrary) return OptionEditorType.Arbitrary;
  else if (t) return OptionEditorType.Calendar;
  else return null;
};

export { linkFromTitle, useWindowOrigin, mapOptionTypeToEditorType };
