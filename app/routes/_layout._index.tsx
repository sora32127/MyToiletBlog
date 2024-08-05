import { ActionFunctionArgs, json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useRef, useTransition } from "react";
import { generateFileName, getMediaUrlList, listKeysInBucket, putFileToStorage } from "~/modules/storage.server";

export const meta: MetaFunction = () => {
  return [
    { title: "現実モデリング" },
    {
      name: "description",
      content: "contradiction29の個人ブログだよ",
    },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const keyList = await listKeysInBucket(context);
  return json({ keyList });
}

export default function Index() {
  const { keyList } = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);

  const actionData = useActionData<typeof action>();

  const submit = useNavigation();
  const isUploading = submit.state === "submitting";
  
  
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">京都はんなり明朝</h1>
      <div>
        <Form
          replace
          method="post"
          encType="multipart/form-data"
          ref={formRef}
        >
          <input type="file" name="file" accept="image/*" />
          <button type="submit" disabled={isUploading}>Upload</button>
        </Form>
      </div>
      {actionData && (
        <>
          <p>{actionData.message}</p>
          <p>{JSON.stringify(actionData.object, null, 2)}</p>
        </>
      )}
      <ul>
        {keyList.map((key) => (
          <li key={key}><Link to={`/images/${key}`}>
            <img src={`/images/${key}`} alt={key} />
            </Link></li>
        ))}
      </ul>
    </div>
  );
}



export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const fileName = await generateFileName();
  const response = await putFileToStorage(context, fileName, file);
  return json({ message: "Uploaded", object: { response }, status: 200 });
}