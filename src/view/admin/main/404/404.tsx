//import { Link } from "react-router-dom";


export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <img
          src="assets/404.png"
          alt="404 Not Found"
          className="mx-auto  max-w-md"
          style={{ backgroundColor: "transparent", backgroundSize: "cover", width: "100%", height: "100%", overflow: "hidden" }}
          
        />

        {/* <h1 className="mt-6 text-4xl font-bold text-slate-800">
          Oops! Page Not Found
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p> */}

      
      </div>
    </div>
  );
}