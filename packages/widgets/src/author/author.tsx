import { getInitConfig } from '@thoughtspot/visual-embed-sdk';
import { Avatar } from '../avatar/avatar';

export interface AuthorProps {
  authorName: string;
  authorId: string;
  className?: string;
}

export const baseIconSrc = '/callosum/v1/image/profile/';

export const Author = ({ authorId, authorName, className }: AuthorProps) => {
  const baseUrl = getInitConfig().thoughtSpotHost;
  const profileImageSrc = `${baseUrl}${baseIconSrc}${authorId}`;
  return (
    <div>
      <Avatar
        name={authorName}
        src={profileImageSrc}
        showName={true}
        className={className}
      ></Avatar>
    </div>
  );
};
