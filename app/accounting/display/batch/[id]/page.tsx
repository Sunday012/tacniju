import { BatchFormScreen } from "./batch-form-screen"

export default function BatchFormPage({ params }: { params: { id: string } }) {
  return <BatchFormScreen params={params} />
}
