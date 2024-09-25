import { PrimaryButton } from '@/components/inputs/button';
import useFetch from '@/hooks/useFetch';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import Joi from 'joi';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

const TAndCEditor = () => {
  const { apiCall } = useFetch();
  const [initialData, setInitialData] = useState<{
    id: number;
    text: string;
    contentType: string;
  }>({
    id: 0,
    text: '',
    contentType: '',
  });
  const [loading, setLoading] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ align: [] }],
      [{ color: [] }],
      ['code-block'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'align',
    'color',
    'code-block',
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let res = await apiCall(
        {
          url: `${Routes.TERMSANDCONDITIONS.GET_TERMS_AND_CONDITIONS.url}?contentType=t_and_c`,
          method: {
            type: 'GET',
            validation: Joi.any(),
          },
        },
        {}
      );
      if (res.status) {
        setInitialData({
          id: res.data[0].id,
          contentType: res.data[0].contentType,
          text: res.data[0].text,
        });
      } else {
        setLoading(false);
        return;
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdateTC = async () => {
    const toast = new Toast('Updating t&c');
    let res = await apiCall(
      Routes.TERMSANDCONDITIONS.EDIT_TERMS_AND_CONDITIONS,
      initialData,
      false
    );

    if (res.status) {
      toast.success('Updated successfully');
    } else {
      toast.error('Error updating t&c');
      return;
    }
  };
  return (
    <>
      <QuillEditor
        value={initialData.text}
        onChange={(e) => {
          console.log(e);
          setInitialData({
            ...initialData,
            text: e,
          });
        }}
        modules={quillModules}
        formats={quillFormats}
      />
      <PrimaryButton className="w-20 ml-auto my-5" onClick={handleUpdateTC}>
        Update
      </PrimaryButton>
    </>
  );
};

export default TAndCEditor;
