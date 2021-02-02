import ModuleFormBeforeSignIn from './ModuleFormBeforeSignIn';
import ModuleForm from './ModuleForm';

// This should probably take in the array containing the modules the person choose yeet
type Props = {
  placeholder?: true; // Remove this when new props are added.
};

const MpeForm: React.FC<Props> = () => (
  <div className="col-md-5">
    <ModuleForm totalMC={0} />
  </div>
);

export default MpeForm;
