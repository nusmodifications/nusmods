import { FC, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { openNotification } from 'actions/app';
import { PlannerState } from 'types/reducers';
import { Upload } from 'react-feather';
import { PlannerStateSchema } from 'types/schemas/planner';

type Props = {
  importPlanner: (importedState: PlannerState) => void;
};

const PlannerImportButton: FC<Props> = (props: Props) => {
  const dispatch = useDispatch();
  const upload = useCallback(
    (importedState: PlannerState) => {
      props.importPlanner(importedState);
      dispatch(openNotification('Imported successfully!'));
    },
    [dispatch, props],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoad = (event: ProgressEvent<FileReader>) => {
    const loaded = event.target?.result as string;
    if (!loaded) {
      return;
    }

    Promise.resolve()
      .then(() => JSON.parse(loaded))
      .then(PlannerStateSchema.parseAsync)
      .then(upload)
      .catch(handleError);
  };

  const handleError = useCallback(() => {
    dispatch(openNotification('Cannot import the uploaded file.'));
  }, [dispatch]);

  const handleFileUpload = (input: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    fileReader.onload = handleLoad;
    fileReader.onerror = handleError;

    const blob: Blob = input.target.files?.[0] as Blob;
    fileReader.readAsText(blob, 'UTF-8');
  };

  return (
    <button className="btn btn-svg btn-outline-primary" type="button" onClick={onClick}>
      <Upload className="svg" />
      <p>Upload</p>
      <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} hidden />
    </button>
  );
};

export default PlannerImportButton;
