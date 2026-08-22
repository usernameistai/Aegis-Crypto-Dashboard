interface TrendSparkLineProps {
  src: string;
  className?: string;
};

const TrendSparkLine = ({ src, className }: TrendSparkLineProps) => {
  return (
    <>
      <div className="h-10 w-24 flex items-center">
        <img 
          src={src} 
          alt=""
          className={`w-full h-full object-contain ${className}`}
        />
      </div>
    </>
  )
}

export default TrendSparkLine