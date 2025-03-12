import CreateNote from "@/components/create-note";
import DatabaseProvider from "@/providers/database-provider";

export default function Home() {
  return (
    <DatabaseProvider>
      <div>
        <div className="sticky x-0 top-0 m-2">
          <CreateNote />
        </div>
        
      </div>
    </DatabaseProvider>
  );
}
