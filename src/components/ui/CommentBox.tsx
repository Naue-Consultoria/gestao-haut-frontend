interface CommentBoxProps {
  author: string;
  text: string;
}

export function CommentBox({ author, text }: CommentBoxProps) {
  return (
    <div className="bg-gray-50 border-l-[3px] border-l-black py-5 px-6 rounded-r-sm mx-6 mb-6">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">{author}</div>
      <div className="text-sm leading-relaxed text-gray-700">{text}</div>
    </div>
  );
}
