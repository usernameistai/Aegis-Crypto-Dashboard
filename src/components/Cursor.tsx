interface CursorProps {
  size?: number;
  className?: string;
}

const Cursor = ({ className }: CursorProps) => {
  return (
    <>
      <span className={`inline-flex flex-col items-center justify-center select-none
         text-xs leading-[0.9] ${className}`}
      >
        <span className=''>
          ▲
        </span>
        <span className=''>
          ▼
        </span>
      </span>
    </>
  )
};

export default Cursor;