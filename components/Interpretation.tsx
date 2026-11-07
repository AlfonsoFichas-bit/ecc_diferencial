export interface InterpretationProps {
  text: string;
}

export function Interpretation(props: InterpretationProps) {
  return (
    <div class="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-800 whitespace-pre-line">
      {props.text}
    </div>
  );
}
