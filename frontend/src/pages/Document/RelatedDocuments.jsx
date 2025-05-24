import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedDocuments } from "../../services/documentService";
import "./Document.css";

const RelatedDocuments = ({ currentDoc }) => {
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);
      try {
        const docs = await getRelatedDocuments({
          educationLevel: currentDoc.educationLevel,
          subject: currentDoc.subject,
          excludeId: currentDoc._id,
        });
        setRelated(docs);
      } catch (error) {
        console.error("Error fetching related documents:", error);
        setRelated([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [currentDoc]);

  return (
    <div className="related-documents">
      <h3 className="related-title">Tài liệu liên quan</h3>
      {isLoading ? (
        <p className="loading-text">Đang tải tài liệu liên quan...</p>
      ) : related.length > 0 ? (
        <div className="document-grid">
          {related.map((doc) => (
            <Link
              key={doc._id}
              to={`/documents/detail/${doc._id}`}
              className="document-card"
            >
              <img
                src={doc.thumbnail || "/assets/images/default-doc.png"}
                alt={doc.title}
                className="document-image"
              />
              <h4 className="document-title">{doc.title}</h4>
              <p className="document-description">
                {doc.description?.slice(0, 80)}...
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-documents">Không có tài liệu liên quan.</p>
      )}
    </div>
  );
};

export default RelatedDocuments;
