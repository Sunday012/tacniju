import { createDreamHeader, getDreamOwners } from "@/app/actions/dreams"
import NewDreamSheet from "@/components/admin/dreams/NewDreamSheet"

export const dynamic = "force-dynamic"

export default async function NewDreamPage() {
  const { owners } = await getDreamOwners()

  async function createDreamHeaderAction(formData: FormData) {
    "use server"
    await createDreamHeader(formData)
  }

  return <NewDreamSheet owners={owners} action={createDreamHeaderAction} />
}
