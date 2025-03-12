import Home from "@/pages/home";
import DatabaseProvider from "@/providers/database-provider";

export default function Index() {
  return (
    <DatabaseProvider>
      <Home />
    </DatabaseProvider>
  );
}
