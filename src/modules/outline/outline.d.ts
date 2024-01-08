/* eslint-disable @typescript-eslint/ban-types */

declare namespace Components {
    namespace Responses {
        export type NotFound = Schemas.Error;
        export type Unauthenticated = Schemas.Error;
        export type Unauthorized = Schemas.Error;
        export type Validation = Schemas.Error;
    }
    namespace Schemas {
        export interface Attachment {
            /**
             * example:
             * image/png
             */
            contentType?: string;
            size?: number;
            name?: string;
            url?: string; // uri
            /**
             * Identifier for the associated document, if any.
             */
            documentId?: string; // uuid
        }
        export interface Auth {
            user?: User;
            team?: Team;
        }
        export interface Collection {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The name of the collection.
             * example:
             * Human Resources
             */
            name?: string;
            /**
             * A description of the collection, may contain markdown formatting
             * example:
             *
             */
            description?: string;
            /**
             * The sort of documents in the collection. Note that not all API responses respect this and it is left as a frontend concern to implement.
             */
            sort?: {
                field?: string;
                direction?: "asc" | "desc";
            };
            /**
             * The position of the collection in the sidebar
             * example:
             * P
             */
            index?: string;
            /**
             * A color representing the collection, this is used to help make collections more identifiable in the UI. It should be in HEX format including the #
             * example:
             * #123123
             */
            color?: string;
            /**
             * A string that represents an icon in the outline-icons package
             */
            icon?: string;
            permission?: Permission;
            /**
             * The date and time that this object was created
             */
            createdAt?: string; // date-time
            /**
             * The date and time that this object was last changed
             */
            updatedAt?: string; // date-time
            /**
             * The date and time that this object was deleted
             */
            deletedAt?: string | null; // date-time
        }
        export interface CollectionGroupMembership {
            /**
             * Unique identifier for the object.
             */
            id?: string;
            /**
             * Identifier for the associated group.
             */
            groupId?: string; // uuid
            /**
             * Identifier for the associated collection.
             */
            collectionId?: string; // uuid
            permission?: Permission;
        }
        export interface Comment {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The editor data representing this comment.
             */
            data?: {
                [key: string]: any;
            };
            /**
             * Identifier for the document this is related to.
             */
            documentId?: string; // uuid
            /**
             * Identifier for the comment this is a child of, if any.
             */
            parentCommentId?: string; // uuid
            /**
             * The date and time that this object was created
             */
            createdAt?: string; // date-time
            createdBy?: User;
            /**
             * The date and time that this object was last changed
             */
            updatedAt?: string; // date-time
            updatedBy?: User;
        }
        export interface Document {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * Identifier for the associated collection.
             */
            collectionId?: string; // uuid
            /**
             * Identifier for the document this is a child of, if any.
             */
            parentDocumentId?: string; // uuid
            /**
             * The title of the document.
             * example:
             * 🎉 Welcome to Acme Inc
             */
            title?: string;
            /**
             * Whether this document should be displayed in a full-width view.
             */
            fullWidth?: boolean;
            /**
             * An emoji associated with the document.
             * example:
             * 🎉
             */
            emoji?: string;
            /**
             * The text content of the document, contains markdown formatting
             * example:
             * …
             */
            text?: string;
            /**
             * A short unique ID that can be used to identify the document as an alternative to the UUID
             * example:
             * hDYep1TPAM
             */
            urlId?: string;
            collaborators?: User[];
            /**
             * Whether this document is pinned in the collection
             */
            pinned?: boolean;
            /**
             * Whether this document is a template
             */
            template?: boolean;
            /**
             * Unique identifier for the template this document was created from, if any
             */
            templateId?: string; // uuid
            /**
             * A number that is auto incrementing with every revision of the document that is saved
             */
            revision?: number;
            /**
             * The date and time that this object was created
             */
            createdAt?: string; // date-time
            createdBy?: User;
            /**
             * The date and time that this object was last changed
             */
            updatedAt?: string; // date-time
            updatedBy?: User;
            /**
             * The date and time that this object was published
             */
            publishedAt?: string | null; // date-time
            /**
             * The date and time that this object was archived
             */
            archivedAt?: string; // date-time
            /**
             * The date and time that this object was deleted
             */
            deletedAt?: string | null; // date-time
        }
        export interface Error {
            /**
             * example:
             * false
             */
            ok?: boolean;
            error?: string;
        }
        export interface Event {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * example:
             * documents.create
             */
            name?: string;
            /**
             * Identifier for the object this event is associated with when it is not one of document, collection, or user.
             */
            modelId?: string; // uuid
            /**
             * The user that performed the action.
             */
            actorId?: string; // uuid
            /**
             * The ip address the action was performed from. This field is only returned when the `auditLog` boolean is true.
             * example:
             * 60.169.88.100
             */
            actorIpAddress?: string;
            /**
             * Identifier for the associated collection, if any
             */
            collectionId?: string; // uuid
            /**
             * Identifier for the associated document, if any
             */
            documentId?: string; // uuid
            /**
             * The date and time that this event was created
             */
            createdAt?: string; // date-time
            /**
             * Additional unstructured data associated with the event
             * example:
             * {
             *   "name": "Equipment list"
             * }
             */
            data?: {
                [key: string]: any;
            };
            actor?: User;
        }
        export interface FileOperation {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The type of file operation.
             * example:
             * export
             */
            type?: "import" | "export";
            /**
             * The state of the file operation.
             * example:
             * complete
             */
            state?: "creating" | "uploading" | "complete" | "error" | "expired";
            collection?: {
                /**
                 * Unique identifier for the object.
                 */
                id?: string; // uuid
                /**
                 * The name of the collection.
                 * example:
                 * Human Resources
                 */
                name?: string;
                /**
                 * A description of the collection, may contain markdown formatting
                 * example:
                 *
                 */
                description?: string;
                /**
                 * The sort of documents in the collection. Note that not all API responses respect this and it is left as a frontend concern to implement.
                 */
                sort?: {
                    field?: string;
                    direction?: "asc" | "desc";
                };
                /**
                 * The position of the collection in the sidebar
                 * example:
                 * P
                 */
                index?: string;
                /**
                 * A color representing the collection, this is used to help make collections more identifiable in the UI. It should be in HEX format including the #
                 * example:
                 * #123123
                 */
                color?: string;
                /**
                 * A string that represents an icon in the outline-icons package
                 */
                icon?: string;
                permission?: Permission;
                /**
                 * The date and time that this object was created
                 */
                createdAt?: string; // date-time
                /**
                 * The date and time that this object was last changed
                 */
                updatedAt?: string; // date-time
                /**
                 * The date and time that this object was deleted
                 */
                deletedAt?: string | null; // date-time
            } | null;
            user?: User;
            /**
             * The size of the resulting file in bytes
             * example:
             * 2048
             */
            size?: number;
            /**
             * The date and time that this object was created
             */
            createdAt?: string; // date-time
        }
        export interface Group {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The name of this group.
             * example:
             * Engineering
             */
            name?: string;
            /**
             * The number of users that are members of the group
             * example:
             * 11
             */
            memberCount?: number;
            /**
             * The date and time that this object was created
             */
            createdAt?: string; // date-time
            /**
             * The date and time that this object was last changed
             */
            updatedAt?: string; // date-time
        }
        export interface GroupMembership {
            /**
             * Unique identifier for the object.
             */
            id?: string;
            /**
             * Identifier for the associated group.
             */
            groupId?: string; // uuid
            /**
             * Identifier for the associated user.
             */
            userId?: string; // uuid
            user?: User;
        }
        export interface Invite {
            /**
             * The full name of the user being invited
             */
            name?: string;
            /**
             * The email address to invite
             */
            email?: string;
            role?: "member" | "guest" | "admin";
        }
        export interface Membership {
            /**
             * Unique identifier for the object.
             */
            id?: string;
            /**
             * Identifier for the associated user.
             */
            userId?: string; // uuid
            /**
             * Identifier for the associated collection.
             */
            collectionId?: string; // uuid
            permission?: Permission;
        }
        export interface NavigationNode {
            /**
             * Unique identifier for the document.
             */
            id?: string; // uuid
            title?: string;
            url?: string;
            children?: NavigationNode[];
        }
        export interface Pagination {
            offset?: number;
            /**
             * example:
             * 25
             */
            limit?: number;
        }
        export type Permission = "read" | "read_write";
        export interface Policy {
            /**
             * Unique identifier for the object this policy references.
             */
            id?: string; // uuid
            abilities?: {
                create?: boolean;
                read?: boolean;
                update?: boolean;
                delete?: boolean;
                restore?: boolean;
                star?: boolean;
                unstar?: boolean;
                share?: boolean;
                download?: boolean;
                pin?: boolean;
                unpin?: boolean;
                move?: boolean;
                archive?: boolean;
                unarchive?: boolean;
                createChildDocument?: boolean;
            };
        }
        export interface Revision {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * Identifier for the associated document.
             */
            documentId?: string; // uuid
            /**
             * Title of the document.
             */
            title?: string;
            /**
             * Body of the document, may contain markdown formatting
             */
            text?: string;
            /**
             * Date and time when this revision was created
             */
            createdAt?: string; // date-time
            createdBy?: User;
        }
        export interface Share {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * Title of the shared document.
             * example:
             * React best practices
             */
            documentTitle?: string;
            /**
             * URL of the original document.
             */
            documentUrl?: string; // uri
            /**
             * URL of the publicly shared document.
             */
            url?: string; // uri
            /**
             * If true the share can be loaded without a user account.
             * example:
             * false
             */
            published?: boolean;
            /**
             * If to also give permission to view documents nested beneath this one.
             * example:
             * true
             */
            includeChildDocuments?: boolean;
            /**
             * Date and time when this share was created
             */
            createdAt?: string; // date-time
            createdBy?: User;
            /**
             * Date and time when this share was edited
             */
            updatedAt?: string; // date-time
            /**
             * Date and time when this share was last viewed
             */
            lastAccessedAt?: string; // date-time
        }
        export interface Sorting {
            /**
             * example:
             * updatedAt
             */
            sort?: string;
            /**
             * example:
             * DESC
             */
            direction?: "ASC" | "DESC";
        }
        export interface Team {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The name of this team, it is usually auto-generated when the first SSO connection is made but can be changed if neccessary.
             */
            name?: string;
            /**
             * The URL for the image associated with this team, it will be displayed in the team switcher and in the top left of the knowledge base along with the name.
             */
            avatarUrl?: string; // uri
            /**
             * Whether this team has share links globally enabled. If this value is false then all sharing UI and APIs are disabled.
             */
            sharing?: boolean;
            /**
             * If set then the referenced collection is where users will be redirected to after signing in instead of the Home screen
             */
            defaultCollectionId?: string; // uuid
            /**
             * If set then this role will be used as the default for users that signup via SSO
             */
            defaultUserRole?: "viewer" | "member" | "admin";
            /**
             * Whether members are allowed to create new collections. If false then only admins can create collections.
             */
            memberCollectionCreate?: boolean;
            /**
             * Whether this team has embeds in documents globally enabled. It can be disabled to reduce potential data leakage to third parties.
             */
            documentEmbeds?: boolean;
            /**
             * Whether this team has collaborative editing in documents globally enabled.
             */
            collaborativeEditing?: boolean;
            /**
             * Whether an invite is required to join this team, if false users may join with a linked SSO provider.
             */
            inviteRequired?: boolean;
            allowedDomains?: string[];
            /**
             * Whether this team has guest signin enabled. Guests can signin with an email address and are not required to have a Google Workspace/Slack SSO account once invited.
             */
            guestSignin?: boolean;
            /**
             * Represents the subdomain at which this team's knowledge base can be accessed.
             */
            subdomain?: string;
            /**
             * The fully qualified URL at which this team's knowledge base can be accessed.
             */
            url?: string; // uri
        }
        export interface User {
            /**
             * Unique identifier for the object.
             */
            id?: string; // uuid
            /**
             * The name of this user, it is migrated from Slack or Google Workspace when the SSO connection is made but can be changed if neccessary.
             * example:
             * Jane Doe
             */
            name?: string;
            /**
             * The URL for the image associated with this user, it will be displayed in the application UI and email notifications.
             */
            avatarUrl?: string; // uri
            /**
             * The email associated with this user, it is migrated from Slack or Google Workspace when the SSO connection is made but can be changed if neccessary.
             */
            email?: string; // email
            /**
             * Whether this user has admin permissions.
             */
            isAdmin?: boolean;
            /**
             * Whether this user has been suspended.
             */
            isSuspended?: boolean;
            /**
             * The last time this user made an API request, this value is updated at most every 5 minutes.
             */
            lastActiveAt?: string; // date-time
            /**
             * The date and time that this user first signed in or was invited as a guest.
             */
            createdAt?: string; // date-time
        }
        export interface View {
            /**
             * Unique identifier for the object.
             */
            id?: string;
            /**
             * Identifier for the associated document.
             */
            documentId?: string; // uuid
            /**
             * When the document was first viewed by the user
             */
            firstViewedAt?: string; // date-time
            /**
             * When the document was last viewed by the user
             */
            lastViewedAt?: string; // date-time
            /**
             * The number of times the user has viewed the document.
             * example:
             * 22
             */
            count?: number;
            user?: User;
        }
    }
}
declare namespace Paths {
    namespace AttachmentsCreate {
        namespace Post {
            export interface RequestBody {
                /**
                 * example:
                 * image.png
                 */
                name: string;
                /**
                 * Identifier for the associated document, if any.
                 */
                documentId?: string; // uuid
                /**
                 * example:
                 * image/png
                 */
                contentType: string;
                /**
                 * Size of the file attachment in bytes.
                 */
                size: number;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        maxUploadSize?: number;
                        uploadUrl?: string; // uri
                        form?: {
                            [key: string]: any;
                        };
                        attachment?: Components.Schemas.Attachment;
                    };
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace AttachmentsDelete {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the attachment.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace AttachmentsRedirect {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the attachment.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $302 {
                }
            }
        }
    }
    namespace AuthConfig {
        namespace Post {
            namespace Responses {
                export interface $200 {
                    data?: {
                        /**
                         * example:
                         * Acme Inc
                         */
                        name?: string;
                        /**
                         * example:
                         * acme-inc.getoutline.com
                         */
                        hostname?: string;
                        services?: {
                            /**
                             * example:
                             * slack
                             */
                            id?: string;
                            /**
                             * example:
                             * Slack
                             */
                            name?: string;
                            /**
                             * example:
                             * https://acme-inc.getoutline.com/auth/slack
                             */
                            authUrl?: string;
                        }[];
                    };
                }
            }
        }
    }
    namespace AuthInfo {
        namespace Post {
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Auth;
                }
                export type $401 = Components.Responses.Unauthenticated;
            }
        }
    }
    namespace CollectionsAddGroup {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                groupId: string; // uuid
                permission?: Components.Schemas.Permission;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        collectionGroupMemberships?: Components.Schemas.CollectionGroupMembership[];
                    };
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsAddUser {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                userId: string; // uuid
                permission?: Components.Schemas.Permission;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        users?: Components.Schemas.User[];
                        memberships?: Components.Schemas.Membership[];
                    };
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsCreate {
        namespace Post {
            export interface RequestBody {
                /**
                 * example:
                 * Human Resources
                 */
                name: string;
                /**
                 * example:
                 *
                 */
                description?: string;
                permission?: Components.Schemas.Permission;
                /**
                 * example:
                 * #123123
                 */
                color?: string;
                /**
                 * example:
                 * false
                 */
                private?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Collection;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace CollectionsDelete {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsDocuments {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the collection.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * []
                     */
                    data?: Components.Schemas.NavigationNode[];
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsExport {
        namespace Post {
            export interface RequestBody {
                format?: "outline-markdown" | "json" | "html";
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        fileOperation?: Components.Schemas.FileOperation;
                    };
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsExportAll {
        namespace Post {
            export interface RequestBody {
                format?: "outline-markdown" | "json" | "html";
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        fileOperation?: Components.Schemas.FileOperation;
                    };
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsGroupMemberships {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * Identifier for the collection
                 */
                id: string; // uuid
                /**
                 * Filter memberships by group names
                 * example:
                 * developers
                 */
                query?: string;
                permission?: Components.Schemas.Permission;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        groups?: Components.Schemas.Group[];
                        collectionGroupMemberships?: Components.Schemas.CollectionGroupMembership[];
                    };
                    pagination?: Components.Schemas.Pagination;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace CollectionsInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the collection.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Collection;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsList {
        namespace Post {
            export type RequestBody = Components.Schemas.Pagination;
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Collection[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace CollectionsMemberships {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * Identifier for the collection
                 */
                id: string; // uuid
                /**
                 * Filter memberships by user names
                 * example:
                 * jenny
                 */
                query?: string;
                permission?: Components.Schemas.Permission;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        users?: Components.Schemas.User[];
                        memberships?: Components.Schemas.Membership[];
                    };
                    pagination?: Components.Schemas.Pagination;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace CollectionsRemoveGroup {
        namespace Post {
            export interface RequestBody {
                /**
                 * Identifier for the collection
                 */
                id: string; // uuid
                groupId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsRemoveUser {
        namespace Post {
            export interface RequestBody {
                /**
                 * Identifier for the collection
                 */
                id: string; // uuid
                userId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CollectionsUpdate {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                /**
                 * example:
                 * Human Resources
                 */
                name?: string;
                permission?: Components.Schemas.Permission;
                /**
                 * example:
                 *
                 */
                description?: string;
                /**
                 * example:
                 * #123123
                 */
                color?: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Collection;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CommentsCreate {
        namespace Post {
            export interface RequestBody {
                id?: string; // uuid
                documentId: string; // uuid
                parentCommentId?: string; // uuid
                data: {
                    [key: string]: any;
                };
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Comment;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CommentsDelete {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace CommentsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * Filter to a specific document
                 */
                documentId?: string; // uuid
                /**
                 * Filter to a specific collection
                 */
                collectionId?: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document[];
                    policies?: Components.Schemas.Policy[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace CommentsUpdate {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                data: {
                    [key: string]: any;
                };
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Comment;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsArchive {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsCreate {
        namespace Post {
            export interface RequestBody {
                /**
                 * example:
                 * Welcome to Acme Inc
                 */
                title: string;
                /**
                 * The body of the document, may contain markdown formatting.
                 * example:
                 * …
                 */
                text?: string;
                collectionId: string; // uuid
                parentDocumentId?: string; // uuid
                templateId?: string; // uuid
                /**
                 * Whether this document should be considered to be a template.
                 */
                template?: boolean;
                /**
                 * Whether this document should be immediately published and made visible to other team members.
                 */
                publish?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace DocumentsDelete {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
                /**
                 * If set to true the document will be destroyed with no way to recover rather than moved to the trash.
                 * example:
                 * false
                 */
                permanent?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsDrafts {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * A collection to search within
                 */
                collectionId?: string; // uuid
                /**
                 * Any documents that have not been updated within the specified period will be filtered out
                 * example:
                 * month
                 */
                dateFilter?: "day" | "week" | "month" | "year";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document[];
                    policies?: Components.Schemas.Policy[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace DocumentsExport {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 */
                id?: string;
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * The document content in Markdown formatting
                     */
                    data?: string;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsImport {
        namespace Post {
            export interface RequestBody {
                /**
                 * Only plain text, markdown, docx, and html format are supported.
                 */
                file?: {
                    [key: string]: any;
                };
                collectionId?: string; // uuid
                parentDocumentId?: string; // uuid
                template?: boolean;
                publish?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 */
                id?: string;
                /**
                 * Unique identifier for a document share, a shareId may be used in place of a document UUID
                 */
                shareId?: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * Optionally filter to a specific collection
                 */
                collectionId?: string; // uuid
                userId?: string; // uuid
                backlinkDocumentId?: string; // uuid
                parentDocumentId?: string; // uuid
                /**
                 * Optionally filter to only templates
                 */
                template?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document[];
                    policies?: Components.Schemas.Policy[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace DocumentsMove {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
                collectionId?: string; // uuid
                parentDocumentId?: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        documents?: Components.Schemas.Document[];
                        collections?: Components.Schemas.Collection[];
                    };
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsRestore {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
                /**
                 * Identifier for the revision to restore to.
                 */
                revisionId?: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsSearch {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * hiring
                 */
                query?: string;
                /**
                 * Any documents that have not been edited by the user identifier will be filtered out
                 */
                userId?: string; // uuid
                /**
                 * A collection to search within
                 */
                collectionId?: string; // uuid
                includeArchived?: boolean;
                includeDrafts?: boolean;
                /**
                 * Any documents that have not been updated within the specified period will be filtered out
                 * example:
                 * month
                 */
                dateFilter?: "day" | "week" | "month" | "year";
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        /**
                         * A short snippet of context from the document that includes the search query.
                         * example:
                         * At Acme Inc our hiring practices are inclusive
                         */
                        context?: string;
                        /**
                         * The ranking used to order search results based on relevance.
                         * example:
                         * 1.1844109
                         */
                        ranking?: number; // float
                        document?: Components.Schemas.Document;
                    }[];
                    policies?: Components.Schemas.Policy[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace DocumentsStar {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
            }
            namespace Responses {
                export interface $200 {
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsTemplatize {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace DocumentsUnpublish {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsUnstar {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
            }
            namespace Responses {
                export interface $200 {
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsUpdate {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the document. Either the UUID or the urlId is acceptable.
                 * example:
                 * hDYep1TPAM
                 */
                id: string;
                /**
                 * The title of the document.
                 */
                title?: string;
                /**
                 * The body of the document, may contain markdown formatting.
                 * example:
                 * …
                 */
                text?: string;
                /**
                 * If true the text field will be appended to the end of the existing document, rather than the default behavior of replacing it. This is potentially useful for things like logging into a document.
                 */
                append?: boolean;
                /**
                 * Whether this document should be published and made visible to other team members, if a draft
                 */
                publish?: boolean;
                /**
                 * Whether the editing session has finished, this will trigger any notifications. This property will soon be deprecated.
                 */
                done?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace DocumentsViewed {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Document[];
                    policies?: Components.Schemas.Policy[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace EventsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * Filter to a specific event, e.g. "collections.create". Event names are in the format "objects.verb"
                 */
                name?: string;
                /**
                 * Filter to events performed by the selected user
                 */
                actorId?: string; // uuid
                /**
                 * Filter to events performed in the selected document
                 */
                documentId?: string; // uuid
                /**
                 * Filter to events performed in the selected collection
                 */
                collectionId?: string; // uuid
                /**
                 * Whether to return detailed events suitable for an audit log. Without this flag less detailed event types will be returned.
                 */
                auditLog?: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Event[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace FileOperationsInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the file operation.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.FileOperation;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace FileOperationsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * The type of fileOperation
                 * example:
                 * export
                 */
                type: "export" | "import";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.FileOperation[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace FileOperationsRedirect {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the file operation.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export type $200 = string; // binary
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace GroupsAddUser {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                userId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        users?: Components.Schemas.User[];
                        groups?: Components.Schemas.Group[];
                        groupMemberships?: Components.Schemas.Membership[];
                    };
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace GroupsCreate {
        namespace Post {
            export interface RequestBody {
                /**
                 * example:
                 * Designers
                 */
                name: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Group;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace GroupsDelete {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace GroupsInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the group.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Group;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace GroupsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Group[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace GroupsMemberships {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * Group id
                 * example:
                 * a32c2ee6-fbde-4654-841b-0eabdc71b812
                 */
                id: string;
                /**
                 * Filter memberships by user names
                 * example:
                 * jenny
                 */
                query?: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        users?: Components.Schemas.User[];
                        groupMemberships?: Components.Schemas.GroupMembership[];
                    };
                    pagination?: Components.Schemas.Pagination;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace GroupsRemoveUser {
        namespace Post {
            export interface RequestBody {
                /**
                 * Identifier for the collection
                 */
                id: string; // uuid
                userId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: {
                        groups?: Components.Schemas.Group[];
                    };
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace GroupsUpdate {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                /**
                 * example:
                 * Designers
                 */
                name: string;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Group;
                    policies?: Components.Schemas.Policy[];
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace RevisionsInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the revision.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Revision;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace RevisionsList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Revision[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace SharesCreate {
        namespace Post {
            export interface RequestBody {
                documentId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Share;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace SharesInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the share.
                 */
                id?: string; // uuid
                /**
                 * Unique identifier for a document. One of id or documentId must be provided.
                 */
                documentId?: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Share;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace SharesList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Share[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace SharesRevoke {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace SharesUpdate {
        namespace Post {
            export interface RequestBody {
                id: string; // uuid
                published: boolean;
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.Share;
                }
                export type $400 = Components.Responses.Validation;
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace UsersActivate {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersDelete {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    /**
                     * example:
                     * true
                     */
                    success?: boolean;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersDemote {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
                /**
                 * Which role to demote to
                 */
                to?: "viewer" | "member";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersInfo {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersInvite {
        namespace Post {
            export interface RequestBody {
                invites: Components.Schemas.Invite[];
            }
            namespace Responses {
                export interface $200 {
                    sent?: Components.Schemas.Invite[];
                    users?: Components.Schemas.User[];
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace UsersList {
        namespace Post {
            export interface RequestBody {
                offset?: number;
                /**
                 * example:
                 * 25
                 */
                limit?: number;
                /**
                 * example:
                 * updatedAt
                 */
                sort?: string;
                /**
                 * example:
                 * DESC
                 */
                direction?: "ASC" | "DESC";
                /**
                 * example:
                 * jane
                 */
                query?: string;
                emails?: string[];
                /**
                 * example:
                 * all
                 */
                filter?: "invited" | "viewers" | "admins" | "active" | "all" | "suspended";
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User[];
                    pagination?: Components.Schemas.Pagination;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace UsersPromote {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersSuspend {
        namespace Post {
            export interface RequestBody {
                /**
                 * Unique identifier for the user.
                 */
                id: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace UsersUpdate {
        namespace Post {
            export interface RequestBody {
                name?: string;
                avatarUrl?: string; // uri
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.User;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
                export type $404 = Components.Responses.NotFound;
            }
        }
    }
    namespace ViewsCreate {
        namespace Post {
            export interface RequestBody {
                documentId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.View;
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
    namespace ViewsList {
        namespace Post {
            export interface RequestBody {
                documentId: string; // uuid
            }
            namespace Responses {
                export interface $200 {
                    data?: Components.Schemas.View[];
                }
                export type $401 = Components.Responses.Unauthenticated;
                export type $403 = Components.Responses.Unauthorized;
            }
        }
    }
}

export interface OperationMethods {
}

export interface PathsDictionary {
  ['/attachments.create']: {
  }
  ['/attachments.redirect']: {
  }
  ['/attachments.delete']: {
  }
  ['/auth.info']: {
  }
  ['/auth.config']: {
  }
  ['/collections.info']: {
  }
  ['/collections.documents']: {
  }
  ['/collections.list']: {
  }
  ['/collections.create']: {
  }
  ['/collections.update']: {
  }
  ['/collections.add_user']: {
  }
  ['/collections.remove_user']: {
  }
  ['/collections.memberships']: {
  }
  ['/collections.add_group']: {
  }
  ['/collections.remove_group']: {
  }
  ['/collections.group_memberships']: {
  }
  ['/collections.delete']: {
  }
  ['/collections.export']: {
  }
  ['/collections.export_all']: {
  }
  ['/comments.create']: {
  }
  ['/comments.update']: {
  }
  ['/comments.delete']: {
  }
  ['/comments.list']: {
  }
  ['/documents.info']: {
  }
  ['/documents.import']: {
  }
  ['/documents.export']: {
  }
  ['/documents.list']: {
  }
  ['/documents.drafts']: {
  }
  ['/documents.viewed']: {
  }
  ['/documents.search']: {
  }
  ['/documents.create']: {
  }
  ['/documents.update']: {
  }
  ['/documents.templatize']: {
  }
  ['/documents.star']: {
  }
  ['/documents.unstar']: {
  }
  ['/documents.unpublish']: {
  }
  ['/documents.move']: {
  }
  ['/documents.archive']: {
  }
  ['/documents.restore']: {
  }
  ['/documents.delete']: {
  }
  ['/events.list']: {
  }
  ['/fileOperations.info']: {
  }
  ['/fileOperations.redirect']: {
  }
  ['/fileOperations.list']: {
  }
  ['/groups.info']: {
  }
  ['/groups.list']: {
  }
  ['/groups.create']: {
  }
  ['/groups.update']: {
  }
  ['/groups.delete']: {
  }
  ['/groups.memberships']: {
  }
  ['/groups.add_user']: {
  }
  ['/groups.remove_user']: {
  }
  ['/revisions.info']: {
  }
  ['/revisions.list']: {
  }
  ['/shares.info']: {
  }
  ['/shares.list']: {
  }
  ['/shares.create']: {
  }
  ['/shares.update']: {
  }
  ['/shares.revoke']: {
  }
  ['/users.invite']: {
  }
  ['/users.info']: {
  }
  ['/users.list']: {
  }
  ['/users.update']: {
  }
  ['/users.promote']: {
  }
  ['/users.demote']: {
  }
  ['/users.suspend']: {
  }
  ['/users.activate']: {
  }
  ['/users.delete']: {
  }
  ['/views.list']: {
  }
  ['/views.create']: {
  }
}

