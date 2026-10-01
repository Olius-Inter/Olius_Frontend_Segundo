import type { PageHeadingProps } from '../../types/driverForm';

export default function PageHeading({ title, description }: PageHeadingProps) {
  return <div className="page-heading"><p className="eyebrow">CADASTROS</p><h1>{title}</h1><p className="lead">{description}</p></div>;
}
