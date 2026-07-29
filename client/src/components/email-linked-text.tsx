const EMAIL_SEGMENT = /([\w.+-]+@[\w-]+\.[\w.-]+)/;

type EmailLinkedTextProps = {
  text: string;
};

const EmailLinkedText = ({ text }: EmailLinkedTextProps) => (
  <>
    {text.split(EMAIL_SEGMENT).map((segment) =>
      EMAIL_SEGMENT.test(segment) ? (
        <a
          key={segment}
          href={`mailto:${segment}`}
          className="underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          {segment}
        </a>
      ) : (
        segment
      ),
    )}
  </>
);

export default EmailLinkedText;
