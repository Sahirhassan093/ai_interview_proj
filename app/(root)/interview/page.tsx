import Agnet from "@/components/Agnet";
import { getCurrentUser } from "@/lib/actions/auth.action";


const page = async () => {
  const user = await getCurrentUser();
  return (
    <>
        <h2>Interview Generation</h2>
        <Agnet userName={user?.name} userId={user?.id} type="generate"/>
    </>
  )
}

export default page;