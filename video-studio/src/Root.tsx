import "./index.css";
import { MyComposition } from "./Composition";
import { PolyglotComposition } from "./PolyglotComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <PolyglotComposition />
      <MyComposition />
    </>
  );
};
