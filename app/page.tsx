import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className='intro'>
        <Image
          style={{ display: "block", marginLeft: "auto", marginRight: "auto", marginTop: "10px"}}
          src="/e-bate-logo.png"
          alt="E-Bate Logo"
          width={500}
          height={500}
        />
        <p style={{ textAlign: "center", fontSize: "30px", fontFamily: "SF Pro Text", fontWeight: "semi-bold" }}>Online platform for debate training.</p>
      </div>
    </>
  );
}
