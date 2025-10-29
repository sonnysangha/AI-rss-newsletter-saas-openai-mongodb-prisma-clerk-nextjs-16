import { getUsers } from "@/actions/actions";

export default async function Home() {
  const users = await getUsers();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Hello {users.length}</h1>
    </div>
  );
}
